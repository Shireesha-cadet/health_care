import { Router, type IRouter } from "express";
import { db, vitalsTable, alertsTable, usersTable } from "@workspace/db";
import { eq, desc, gte, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/generate-report", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.user!.id;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const [userRecord] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const vitals = await db.select().from(vitalsTable)
    .where(and(eq(vitalsTable.userId, userId), gte(vitalsTable.createdAt, cutoff)))
    .orderBy(desc(vitalsTable.createdAt))
    .limit(20);
  const alerts = await db.select().from(alertsTable)
    .where(and(eq(alertsTable.userId, userId), gte(alertsTable.createdAt, cutoff)))
    .orderBy(desc(alertsTable.createdAt))
    .limit(10);

  const avg = (arr: number[]) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : "N/A";
  const hrs = vitals.map(v => v.heartRate);
  const sys = vitals.map(v => v.systolicBp);
  const dia = vitals.map(v => v.diastolicBp);
  const spo = vitals.map(v => v.spo2);
  const glu = vitals.map(v => v.glucose);
  const tmp = vitals.map(v => v.temperature);

  const criticals = vitals.filter(v => v.status === "critical").length;
  const normals = vitals.filter(v => v.status === "normal").length;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>VitalCare Health Report — ${userRecord?.name || "Patient"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; color: #1e293b; background: #fff; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: 800; color: #2563eb; }
    .report-meta { text-align: right; color: #64748b; font-size: 13px; }
    h2 { color: #1e293b; font-size: 18px; margin: 24px 0 12px; border-left: 4px solid #2563eb; padding-left: 12px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
    .info-item label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .info-item p { font-weight: 600; font-size: 15px; margin-top: 2px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .stat-card { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 14px; text-align: center; }
    .stat-card .value { font-size: 22px; font-weight: 700; color: #0369a1; }
    .stat-card .label { font-size: 11px; color: #64748b; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #2563eb; color: white; padding: 10px 8px; text-align: left; font-weight: 600; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) td { background: #f8fafc; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    .badge-normal { background: #dcfce7; color: #166534; }
    .badge-risk { background: #fef9c3; color: #854d0e; }
    .badge-critical { background: #fee2e2; color: #991b1b; }
    .alert-item { padding: 10px 12px; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid; }
    .alert-critical { background: #fee2e2; border-color: #ef4444; }
    .alert-warning { background: #fef9c3; border-color: #f59e0b; }
    .alert-info { background: #dbeafe; border-color: #3b82f6; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">⚕ VitalCare</div>
      <div style="color:#64748b;font-size:13px;margin-top:4px;">AI-Powered Healthcare Monitoring</div>
    </div>
    <div class="report-meta">
      <div style="font-size:16px;font-weight:700;color:#1e293b;">Health Report</div>
      <div>Generated: ${new Date().toLocaleString("en-IN")}</div>
      <div>Period: Last 30 days</div>
    </div>
  </div>

  <h2>Patient Information</h2>
  <div class="info-grid">
    <div class="info-item"><label>Full Name</label><p>${userRecord?.name || "N/A"}</p></div>
    <div class="info-item"><label>Email</label><p>${userRecord?.email || "N/A"}</p></div>
    <div class="info-item"><label>Role</label><p>${userRecord?.role || "Patient"}</p></div>
    <div class="info-item"><label>Report Date</label><p>${new Date().toLocaleDateString("en-IN")}</p></div>
  </div>

  <h2>Health Summary</h2>
  <div class="stats-grid">
    <div class="stat-card"><div class="value">${vitals.length}</div><div class="label">Vitals Recorded</div></div>
    <div class="stat-card"><div class="value">${normals}</div><div class="label">Normal Readings</div></div>
    <div class="stat-card" style="background:#fef2f2;border-color:#fecaca;"><div class="value" style="color:#dc2626;">${criticals}</div><div class="label">Critical Readings</div></div>
  </div>

  <h2>Average Vitals (Last 30 Days)</h2>
  <div class="stats-grid" style="grid-template-columns: repeat(3,1fr);">
    <div class="stat-card"><div class="value">${avg(hrs)}</div><div class="label">Heart Rate (bpm)</div></div>
    <div class="stat-card"><div class="value">${avg(sys)}/${avg(dia)}</div><div class="label">Blood Pressure (mmHg)</div></div>
    <div class="stat-card"><div class="value">${avg(spo)}%</div><div class="label">SpO2</div></div>
    <div class="stat-card"><div class="value">${avg(glu)}</div><div class="label">Glucose (mg/dL)</div></div>
    <div class="stat-card"><div class="value">${avg(tmp)}°C</div><div class="label">Temperature</div></div>
    <div class="stat-card"><div class="value">${alerts.length}</div><div class="label">Health Alerts</div></div>
  </div>

  ${vitals.length > 0 ? `
  <h2>Recent Vitals Log</h2>
  <table>
    <thead><tr><th>Date</th><th>HR (bpm)</th><th>BP (mmHg)</th><th>SpO2 (%)</th><th>Glucose</th><th>Temp (°C)</th><th>Status</th></tr></thead>
    <tbody>
      ${vitals.slice(0, 10).map(v => `
      <tr>
        <td>${new Date(v.createdAt).toLocaleDateString("en-IN")}</td>
        <td>${v.heartRate}</td>
        <td>${v.systolicBp}/${v.diastolicBp}</td>
        <td>${v.spo2}</td>
        <td>${v.glucose}</td>
        <td>${v.temperature}</td>
        <td><span class="badge badge-${v.status}">${v.status.toUpperCase()}</span></td>
      </tr>`).join("")}
    </tbody>
  </table>` : "<p style='color:#64748b;margin:12px 0;'>No vitals recorded in this period.</p>"}

  ${alerts.length > 0 ? `
  <h2>Health Alerts</h2>
  ${alerts.map(a => `
  <div class="alert-item alert-${a.severity}">
    <strong>${a.message}</strong>
    <div style="font-size:12px;color:#64748b;margin-top:4px;">${new Date(a.createdAt).toLocaleString("en-IN")} • ${a.severity.toUpperCase()}</div>
  </div>`).join("")}` : ""}

  <div class="footer">
    <p>This report was auto-generated by VitalCare AI Platform. For medical decisions, always consult a qualified healthcare professional.</p>
    <p style="margin-top:6px;">© ${new Date().getFullYear()} VitalCare Health Technologies</p>
  </div>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.setHeader("Content-Disposition", `attachment; filename="VitalCare_Report_${userId}_${Date.now()}.html"`);
  res.send(html);
});

export default router;
