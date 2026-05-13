import { Router, type IRouter } from "express";
import { db, appointmentsTable, usersTable } from "@workspace/db";
import { eq, or, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";
import {
  CreateAppointmentBody,
  UpdateAppointmentBody,
  UpdateAppointmentParams,
  GetAppointmentsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/appointments", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetAppointmentsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db.select().from(appointmentsTable)
    .where(
      or(
        eq(appointmentsTable.patientId, req.user!.id),
        eq(appointmentsTable.doctorId, req.user!.id)
      )
    )
    .orderBy(desc(appointmentsTable.scheduledAt));

  // Attach names
  const allUsers = await db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable);
  const userMap = new Map(allUsers.map(u => [u.id, u.name]));

  const enriched = rows.map(a => ({
    ...a,
    patientName: userMap.get(a.patientId) ?? null,
    doctorName: userMap.get(a.doctorId) ?? null,
  }));

  res.json(enriched);
});

router.post("/appointments", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [appt] = await db.insert(appointmentsTable).values({
    patientId: req.user!.id,
    doctorId: parsed.data.doctorId,
    scheduledAt: new Date(parsed.data.scheduledAt),
    reason: parsed.data.reason,
    notes: parsed.data.notes ?? null,
    status: "pending",
  }).returning();

  const allUsers = await db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable);
  const userMap = new Map(allUsers.map(u => [u.id, u.name]));

  res.status(201).json({
    ...appt,
    patientName: userMap.get(appt.patientId) ?? null,
    doctorName: userMap.get(appt.doctorId) ?? null,
  });
});

router.patch("/appointments/:appointmentId", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.appointmentId) ? req.params.appointmentId[0] : req.params.appointmentId;
  const appointmentId = parseInt(rawId, 10);
  if (isNaN(appointmentId)) {
    res.status(400).json({ error: "Invalid appointment ID" });
    return;
  }

  const parsed = UpdateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status != null) updateData.status = parsed.data.status;
  if (parsed.data.notes != null) updateData.notes = parsed.data.notes;

  const [updated] = await db.update(appointmentsTable)
    .set(updateData)
    .where(eq(appointmentsTable.id, appointmentId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  const allUsers = await db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable);
  const userMap = new Map(allUsers.map(u => [u.id, u.name]));

  res.json({
    ...updated,
    patientName: userMap.get(updated.patientId) ?? null,
    doctorName: userMap.get(updated.doctorId) ?? null,
  });
});

export default router;
