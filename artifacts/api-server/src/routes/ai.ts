import { Router, type IRouter } from "express";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { AiChatBody } from "@workspace/api-zod";

const router: IRouter = Router();

const healthTips: Record<string, string[]> = {
  heartRate: ["Maintain a regular exercise routine", "Avoid caffeine and alcohol", "Practice deep breathing and stress management"],
  bloodPressure: ["Reduce sodium intake", "Exercise regularly", "Limit alcohol and quit smoking", "Maintain a healthy weight"],
  spo2: ["Practice breathing exercises", "Avoid smoking", "Stay at appropriate altitude", "Consult a doctor if persistently low"],
  glucose: ["Monitor carbohydrate intake", "Exercise regularly", "Maintain a healthy weight", "Follow prescribed medication"],
  temperature: ["Stay hydrated", "Rest adequately", "Take prescribed antipyretics", "Seek immediate care if above 40°C"],
  general: ["Stay hydrated (8 glasses/day)", "Exercise 30 min daily", "Get 7-9 hours sleep", "Manage stress effectively", "Schedule regular check-ups"],
};

function generateHealthResponse(message: string, context?: string): { reply: string; suggestions: string[] } {
  const lower = message.toLowerCase();

  if (lower.includes("heart") || lower.includes("pulse") || lower.includes("bpm")) {
    return {
      reply: `Based on your question about heart rate, here's what you should know: A normal resting heart rate for adults ranges from 60-100 bpm. ${context ? `Your current vitals show: ${context}. ` : ""}Athletes may have rates as low as 40 bpm. If you're experiencing chest pain, shortness of breath, or dizziness along with an abnormal heart rate, please seek immediate medical attention.`,
      suggestions: healthTips.heartRate,
    };
  }
  if (lower.includes("blood pressure") || lower.includes("bp") || lower.includes("hypertension")) {
    return {
      reply: `Regarding blood pressure: Normal is below 120/80 mmHg. Elevated is 120-129/<80. High BP Stage 1 is 130-139/80-89, and Stage 2 is 140+/90+. ${context ? `Your recorded vitals: ${context}. ` : ""}Consistent high blood pressure increases risk of heart disease and stroke. Lifestyle modifications and medication can help manage it effectively.`,
      suggestions: healthTips.bloodPressure,
    };
  }
  if (lower.includes("oxygen") || lower.includes("spo2") || lower.includes("saturation")) {
    return {
      reply: `About blood oxygen (SpO2): Normal saturation is 95-100%. Levels below 90% are considered critically low and require immediate medical attention. ${context ? `Your SpO2 data: ${context}. ` : ""}Low oxygen can indicate respiratory conditions like COPD, pneumonia, or heart problems.`,
      suggestions: healthTips.spo2,
    };
  }
  if (lower.includes("glucose") || lower.includes("sugar") || lower.includes("diabetes")) {
    return {
      reply: `About blood glucose: Fasting normal is 70-100 mg/dL. Post-meal normal is below 140 mg/dL. Pre-diabetes: 100-125 mg/dL (fasting). Diabetes: 126+ mg/dL (fasting). ${context ? `Your glucose readings: ${context}. ` : ""}Consistent monitoring and lifestyle changes are key to managing blood sugar.`,
      suggestions: healthTips.glucose,
    };
  }
  if (lower.includes("temperature") || lower.includes("fever")) {
    return {
      reply: `About body temperature: Normal is 36.1–37.2°C (97–99°F). A fever is generally defined as above 38°C (100.4°F). ${context ? `Your temperature: ${context}. ` : ""}High fevers (>39.5°C) can be dangerous and require prompt medical evaluation. Stay hydrated and monitor closely.`,
      suggestions: healthTips.temperature,
    };
  }
  if (lower.includes("emergency") || lower.includes("critical") || lower.includes("urgent")) {
    return {
      reply: "⚠️ If you are experiencing a medical emergency, please call emergency services (108/911) immediately! Do not rely on this AI assistant in an emergency situation. Get professional medical help right away.",
      suggestions: ["Call 108 or 911 immediately", "Go to nearest emergency room", "Contact your doctor urgently", "Notify your caretaker"],
    };
  }

  return {
    reply: `Thank you for your health question. Based on your inquiry: "${message}"${context ? ` (Current vitals context: ${context})` : ""}, I recommend maintaining regular health monitoring, staying hydrated, and consulting with your healthcare provider for personalized advice. Your health data is being monitored and any anomalies will trigger automatic alerts. Is there a specific vital sign you'd like to know more about?`,
    suggestions: healthTips.general,
  };
}

router.post("/ai/chat", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = AiChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { message, context } = parsed.data;
  const response = generateHealthResponse(message, context ?? undefined);
  res.json(response);
});

export default router;
