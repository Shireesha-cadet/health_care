import { Router, type IRouter } from "express";
import { db, vitalsTable, alertsTable, usersTable } from "@workspace/db";
import { eq, desc, and, gte } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { analyzeVitals } from "../lib/anomaly";
import {
  CreateVitalBody,
  GetVitalsQueryParams,
  GetLatestVitalsQueryParams,
  GetVitalHistoryQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/vitals", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetVitalsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { userId, period, limit } = params.data;
  const targetUserId = userId ?? req.user!.id;

  let query = db.select().from(vitalsTable).where(eq(vitalsTable.userId, targetUserId)).$dynamic();

  if (period === "daily") {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 1);
    query = query.where(and(eq(vitalsTable.userId, targetUserId), gte(vitalsTable.createdAt, cutoff)));
  } else if (period === "weekly") {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    query = query.where(and(eq(vitalsTable.userId, targetUserId), gte(vitalsTable.createdAt, cutoff)));
  } else if (period === "monthly") {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    query = query.where(and(eq(vitalsTable.userId, targetUserId), gte(vitalsTable.createdAt, cutoff)));
  }

  const rows = await query.orderBy(desc(vitalsTable.createdAt)).limit(limit ?? 100);
  res.json(rows);
});

router.post("/vitals", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateVitalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { heartRate, systolicBp, diastolicBp, spo2, glucose, temperature, notes } = parsed.data;
  const analysis = analyzeVitals({ heartRate, systolicBp, diastolicBp, spo2, glucose, temperature });

  const [vital] = await db.insert(vitalsTable).values({
    userId: req.user!.id,
    heartRate, systolicBp, diastolicBp, spo2, glucose, temperature,
    status: analysis.status,
    notes: notes ?? null,
  }).returning();

  // Create alerts for anomalies
  if (analysis.alerts.length > 0) {
    const vitalsStr = JSON.stringify({ heartRate, systolicBp, diastolicBp, spo2, glucose, temperature });

    // Find caretaker phone
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));

    for (const alert of analysis.alerts) {
      await db.insert(alertsTable).values({
        userId: req.user!.id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        vitals: vitalsStr,
        isRead: false,
        smsSent: false,
      });
    }

    req.log.info({ userId: req.user!.id, alertCount: analysis.alerts.length }, "Health alerts created");
  }

  res.status(201).json(vital);
});

router.get("/vitals/latest", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetLatestVitalsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const targetUserId = params.data.userId ?? req.user!.id;
  const [latest] = await db.select().from(vitalsTable)
    .where(eq(vitalsTable.userId, targetUserId))
    .orderBy(desc(vitalsTable.createdAt))
    .limit(1);

  if (!latest) {
    res.json({
      heartRate: null, systolicBp: null, diastolicBp: null,
      spo2: null, glucose: null, temperature: null,
      overallStatus: "unknown", lastUpdated: null,
    });
    return;
  }

  res.json({
    heartRate: latest.heartRate,
    systolicBp: latest.systolicBp,
    diastolicBp: latest.diastolicBp,
    spo2: latest.spo2,
    glucose: latest.glucose,
    temperature: latest.temperature,
    overallStatus: latest.status,
    lastUpdated: latest.createdAt,
  });
});

router.get("/vitals/history", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetVitalHistoryQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const targetUserId = params.data.userId ?? req.user!.id;

  const records = await db.select().from(vitalsTable)
    .where(eq(vitalsTable.userId, targetUserId))
    .orderBy(desc(vitalsTable.createdAt))
    .limit(50);

  const allAlerts = await db.select().from(alertsTable)
    .where(eq(alertsTable.userId, targetUserId));

  const criticalCount = allAlerts.filter(a => a.severity === "critical").length;

  res.json({
    records,
    alertCount: allAlerts.length,
    criticalCount,
  });
});

export default router;
