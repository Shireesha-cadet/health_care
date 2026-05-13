import { Router, type IRouter } from "express";
import { db, vitalsTable, alertsTable } from "@workspace/db";
import { eq, desc, gte, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/insights", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.user!.id;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  const records = await db.select().from(vitalsTable)
    .where(and(eq(vitalsTable.userId, userId), gte(vitalsTable.createdAt, cutoff)))
    .orderBy(vitalsTable.createdAt);

  const alerts = await db.select().from(alertsTable)
    .where(and(eq(alertsTable.userId, userId), gte(alertsTable.createdAt, cutoff)))
    .orderBy(desc(alertsTable.createdAt));

  const insights: { type: string; title: string; description: string; severity: string; icon: string }[] = [];

  if (records.length === 0) {
    res.json({
      insights: [
        { type: "info", title: "No recent data", description: "Log your vitals regularly to receive personalized AI health insights.", severity: "info", icon: "activity" }
      ],
      summary: "Start logging your vitals to get personalized health insights.",
      score: null,
      period: "Last 7 days",
      recordCount: 0,
    });
    return;
  }

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const trend = (arr: number[]) => arr.length < 2 ? "stable" : arr[arr.length - 1] - arr[0] > arr[0] * 0.05 ? "increasing" : arr[arr.length - 1] - arr[0] < -arr[0] * 0.05 ? "decreasing" : "stable";

  const heartRates = records.map(r => r.heartRate);
  const systolicBps = records.map(r => r.systolicBp);
  const diastolicBps = records.map(r => r.diastolicBp);
  const spo2s = records.map(r => r.spo2);
  const glucoses = records.map(r => r.glucose);
  const temps = records.map(r => r.temperature);

  const avgHr = avg(heartRates);
  const avgSys = avg(systolicBps);
  const avgSpo2 = avg(spo2s);
  const avgGlucose = avg(glucoses);
  const hrTrend = trend(heartRates);
  const bpTrend = trend(systolicBps);

  if (bpTrend === "increasing" && avgSys > 125) {
    insights.push({ type: "warning", title: "Blood Pressure Increasing", description: `Your systolic BP has been trending upward over the past 7 days (avg: ${avgSys.toFixed(0)} mmHg). Consider reducing sodium intake and monitoring more frequently.`, severity: "warning", icon: "trending-up" });
  } else if (avgSys > 140) {
    insights.push({ type: "critical", title: "High Blood Pressure Detected", description: `Your average systolic BP (${avgSys.toFixed(0)} mmHg) is above the normal range. Please consult your doctor.`, severity: "critical", icon: "alert-triangle" });
  } else {
    insights.push({ type: "good", title: "Blood Pressure Stable", description: `Your blood pressure has been well-controlled this week (avg: ${avgSys.toFixed(0)}/${avg(diastolicBps).toFixed(0)} mmHg).`, severity: "good", icon: "check-circle" });
  }

  if (avgGlucose > 140) {
    insights.push({ type: "critical", title: "High Glucose Warning", description: `Your average blood glucose (${avgGlucose.toFixed(0)} mg/dL) is elevated. This may indicate insulin resistance. Consult your endocrinologist.`, severity: "critical", icon: "alert-triangle" });
  } else if (avgGlucose > 100) {
    insights.push({ type: "warning", title: "Borderline Glucose Levels", description: `Average glucose of ${avgGlucose.toFixed(0)} mg/dL falls in the pre-diabetic range. Dietary adjustments are recommended.`, severity: "warning", icon: "trending-up" });
  } else {
    insights.push({ type: "good", title: "Glucose Under Control", description: `Blood glucose is in the healthy range this week (avg: ${avgGlucose.toFixed(0)} mg/dL). Keep up the good dietary habits.`, severity: "good", icon: "check-circle" });
  }

  if (avgSpo2 < 94) {
    insights.push({ type: "critical", title: "Low Blood Oxygen", description: `Average SpO2 of ${avgSpo2.toFixed(1)}% is below safe levels. Seek immediate medical evaluation.`, severity: "critical", icon: "alert-triangle" });
  } else if (avgSpo2 < 96) {
    insights.push({ type: "warning", title: "SpO2 Slightly Low", description: `Your oxygen saturation (${avgSpo2.toFixed(1)}%) is slightly below optimal. Monitor closely and avoid high-altitude activities.`, severity: "warning", icon: "activity" });
  } else {
    insights.push({ type: "good", title: "Healthy Oxygen Levels", description: `Excellent blood oxygen saturation at ${avgSpo2.toFixed(1)}%. Your respiratory health looks good.`, severity: "good", icon: "check-circle" });
  }

  if (hrTrend === "increasing" && avgHr > 90) {
    insights.push({ type: "warning", title: "Elevated Heart Rate Trend", description: `Heart rate has been trending upward (avg: ${avgHr.toFixed(0)} bpm). Stress, dehydration, or caffeine may be contributing factors.`, severity: "warning", icon: "trending-up" });
  } else if (avgHr > 100) {
    insights.push({ type: "critical", title: "Tachycardia Warning", description: `Average resting heart rate of ${avgHr.toFixed(0)} bpm is above normal. Please consult a cardiologist.`, severity: "critical", icon: "alert-triangle" });
  } else {
    insights.push({ type: "good", title: "Heart Rate Normal", description: `Resting heart rate is healthy at an average of ${avgHr.toFixed(0)} bpm this week.`, severity: "good", icon: "heart" });
  }

  if (alerts.filter(a => a.severity === "critical").length > 2) {
    insights.push({ type: "critical", title: "Multiple Critical Alerts", description: `You had ${alerts.filter(a => a.severity === "critical").length} critical alerts this week. Please schedule a doctor consultation urgently.`, severity: "critical", icon: "alert-triangle" });
  }

  const critCount = insights.filter(i => i.severity === "critical").length;
  const warnCount = insights.filter(i => i.severity === "warning").length;
  const goodCount = insights.filter(i => i.severity === "good").length;
  const score = Math.max(0, Math.min(100, Math.round((goodCount * 25 - critCount * 30 - warnCount * 10) + 60)));

  const summaries = critCount > 0
    ? "Your health requires immediate medical attention. Please consult a doctor."
    : warnCount > 0
      ? "Your health metrics show some areas of concern. Monitoring and lifestyle changes are recommended."
      : "Your health metrics are looking great this week! Keep maintaining your healthy habits.";

  res.json({ insights, summary: summaries, score, period: "Last 7 days", recordCount: records.length });
});

export default router;
