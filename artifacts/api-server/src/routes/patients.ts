import { Router, type IRouter } from "express";
import { db, usersTable, vitalsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/doctors", requireAuth, async (_req, res): Promise<void> => {
  const doctors = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    phone: usersTable.phone,
    role: usersTable.role,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.role, "doctor"));
  res.json(doctors);
});

router.get("/patients", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const patients = await db.select().from(usersTable).where(eq(usersTable.role, "patient"));

  const enriched = await Promise.all(
    patients.map(async (p) => {
      const [latest] = await db
        .select()
        .from(vitalsTable)
        .where(eq(vitalsTable.userId, p.id))
        .orderBy(desc(vitalsTable.createdAt))
        .limit(1);

      return {
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        overallStatus: latest?.status ?? "unknown",
        lastVitalAt: latest?.createdAt ?? null,
        latestHeartRate: latest?.heartRate ?? null,
        latestSpo2: latest?.spo2 ?? null,
        latestBp: latest ? `${latest.systolicBp}/${latest.diastolicBp}` : null,
      };
    })
  );

  res.json(enriched);
});

export default router;
