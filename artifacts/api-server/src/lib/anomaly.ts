export type HealthStatus = "normal" | "risk" | "critical";

export interface VitalValues {
  heartRate: number;
  systolicBp: number;
  diastolicBp: number;
  spo2: number;
  glucose: number;
  temperature: number;
}

export interface AnomalyResult {
  status: HealthStatus;
  alerts: { type: string; severity: "warning" | "critical"; message: string }[];
}

export function analyzeVitals(v: VitalValues): AnomalyResult {
  const alerts: AnomalyResult["alerts"] = [];
  let worstStatus: HealthStatus = "normal";

  const escalate = (s: HealthStatus) => {
    if (s === "critical") worstStatus = "critical";
    else if (s === "risk" && worstStatus !== "critical") worstStatus = "risk";
  };

  if (v.systolicBp > 180 || v.diastolicBp > 120) {
    escalate("critical");
    alerts.push({ type: "high_bp", severity: "critical", message: `Critical hypertension: BP ${v.systolicBp}/${v.diastolicBp} mmHg` });
  } else if (v.systolicBp > 140 || v.diastolicBp > 90) {
    escalate("risk");
    alerts.push({ type: "high_bp", severity: "warning", message: `Elevated blood pressure: ${v.systolicBp}/${v.diastolicBp} mmHg` });
  }

  if (v.spo2 < 90) {
    escalate("critical");
    alerts.push({ type: "low_spo2", severity: "critical", message: `Critically low oxygen saturation: ${v.spo2}%` });
  } else if (v.spo2 < 95) {
    escalate("risk");
    alerts.push({ type: "low_spo2", severity: "warning", message: `Low oxygen saturation: ${v.spo2}%` });
  }

  if (v.glucose > 300) {
    escalate("critical");
    alerts.push({ type: "high_glucose", severity: "critical", message: `Critically high blood glucose: ${v.glucose} mg/dL` });
  } else if (v.glucose > 180) {
    escalate("risk");
    alerts.push({ type: "high_glucose", severity: "warning", message: `Elevated blood glucose: ${v.glucose} mg/dL` });
  }

  if (v.temperature > 39.5) {
    escalate("critical");
    alerts.push({ type: "high_temperature", severity: "critical", message: `High fever: ${v.temperature}°C` });
  } else if (v.temperature > 38) {
    escalate("risk");
    alerts.push({ type: "high_temperature", severity: "warning", message: `Fever: ${v.temperature}°C` });
  }

  if (v.heartRate > 150 || v.heartRate < 40) {
    escalate("critical");
    alerts.push({ type: v.heartRate > 150 ? "high_heart_rate" : "low_heart_rate", severity: "critical", message: `Dangerous heart rate: ${v.heartRate} bpm` });
  } else if (v.heartRate > 100 || v.heartRate < 50) {
    escalate("risk");
    alerts.push({ type: v.heartRate > 100 ? "high_heart_rate" : "low_heart_rate", severity: "warning", message: `Abnormal heart rate: ${v.heartRate} bpm` });
  }

  return { status: worstStatus, alerts };
}
