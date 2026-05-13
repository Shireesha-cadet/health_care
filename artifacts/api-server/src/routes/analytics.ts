import { Router, type IRouter } from "express";
import { db, vitalsTable, alertsTable, appointmentsTable, usersTable } from "@workspace/db";
import { eq, desc, gte, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { GetDashboardDataQueryParams, GetVitalTrendsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/analytics/dashboard", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetDashboardDataQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const targetUserId = params.data.userId ?? req.user!.id;
  const role = params.data.role ?? req.user!.role;

  // Count patients
  const allPatients = await db.select().from(usersTable).where(eq(usersTable.role, "patient"));
  const totalPatients = allPatients.length;

  // All unread alerts
  const allAlerts = role === "patient"
    ? await db.select().from(alertsTable).where(eq(alertsTable.userId, targetUserId)).orderBy(desc(alertsTable.createdAt)).limit(10)
    : await db.select().from(alertsTable).orderBy(desc(alertsTable.createdAt)).limit(10);

  const activeAlerts = allAlerts.filter(a => !a.isRead).length;
  const criticalAlerts = allAlerts.filter(a => a.severity === "critical" && !a.isRead).length;

  // Today's appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const allAppointments = await db.select().from(appointmentsTable);
  const todayAppointments = allAppointments.filter(a => {
    const d = new Date(a.scheduledAt);
    return d >= today;
  }).length;

  // Recent vitals
  const recentVitals = role === "patient"
    ? await db.select().from(vitalsTable).where(eq(vitalsTable.userId, targetUserId)).orderBy(desc(vitalsTable.createdAt)).limit(5)
    : await db.select().from(vitalsTable).orderBy(desc(vitalsTable.createdAt)).limit(5);

  // Status breakdown
  const vitalsData = role === "patient"
    ? await db.select().from(vitalsTable).where(eq(vitalsTable.userId, targetUserId))
    : await db.select().from(vitalsTable);

  const statusBreakdown = {
    normal: vitalsData.filter(v => v.status === "normal").length,
    risk: vitalsData.filter(v => v.status === "risk").length,
    critical: vitalsData.filter(v => v.status === "critical").length,
  };

  res.json({
    totalPatients,
    criticalAlerts,
    todayAppointments,
    activeAlerts,
    recentAlerts: allAlerts.slice(0, 5),
    recentVitals,
    statusBreakdown,
  });
});

router.get("/analytics/trends", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetVitalTrendsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const targetUserId = params.data.userId ?? req.user!.id;
  const period = params.data.period ?? "weekly";

  let days = 7;
  if (period === "daily") days = 1;
  else if (period === "monthly") days = 30;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const records = await db.select().from(vitalsTable)
    .where(and(eq(vitalsTable.userId, targetUserId), gte(vitalsTable.createdAt, cutoff)))
    .orderBy(vitalsTable.createdAt);

  // Build time-bucketed labels
  const labelSet = new Map<string, {
    heartRate: number[]; systolicBp: number[]; diastolicBp: number[];
    spo2: number[]; glucose: number[]; temperature: number[];
  }>();

  for (const r of records) {
    const d = new Date(r.createdAt);
    const key = period === "daily"
      ? `${d.getHours()}:00`
      : `${d.getMonth() + 1}/${d.getDate()}`;

    if (!labelSet.has(key)) {
      labelSet.set(key, { heartRate: [], systolicBp: [], diastolicBp: [], spo2: [], glucose: [], temperature: [] });
    }
    const bucket = labelSet.get(key)!;
    bucket.heartRate.push(r.heartRate);
    bucket.systolicBp.push(r.systolicBp);
    bucket.diastolicBp.push(r.diastolicBp);
    bucket.spo2.push(r.spo2);
    bucket.glucose.push(r.glucose);
    bucket.temperature.push(r.temperature);
  }

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

  const labels = Array.from(labelSet.keys());
  const trendData = {
    labels,
    heartRate: labels.map(l => avg(labelSet.get(l)!.heartRate)),
    systolicBp: labels.map(l => avg(labelSet.get(l)!.systolicBp)),
    diastolicBp: labels.map(l => avg(labelSet.get(l)!.diastolicBp)),
    spo2: labels.map(l => avg(labelSet.get(l)!.spo2)),
    glucose: labels.map(l => avg(labelSet.get(l)!.glucose)),
    temperature: labels.map(l => avg(labelSet.get(l)!.temperature)),
  };

  // If no data, return sample placeholders
  if (labels.length === 0) {
    const sampleLabels = period === "daily"
      ? ["0:00","4:00","8:00","12:00","16:00","20:00"]
      : period === "weekly"
        ? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
        : Array.from({length: 10}, (_, i) => `Day ${i + 1}`);
    res.json({
      labels: sampleLabels,
      heartRate: sampleLabels.map(() => null),
      systolicBp: sampleLabels.map(() => null),
      diastolicBp: sampleLabels.map(() => null),
      spo2: sampleLabels.map(() => null),
      glucose: sampleLabels.map(() => null),
      temperature: sampleLabels.map(() => null),
    });
    return;
  }

  res.json(trendData);
});

export default router;
