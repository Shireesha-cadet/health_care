import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

const ambulances = [
  { id: "AMB-001", driver: "Rajesh Kumar", phone: "+91 98765 43210", type: "Advanced Life Support", status: "available" },
  { id: "AMB-002", driver: "Suresh Patel", phone: "+91 98765 43211", type: "Basic Life Support", status: "available" },
  { id: "AMB-003", driver: "Manish Singh", phone: "+91 98765 43212", type: "Advanced Life Support", status: "dispatched" },
  { id: "AMB-004", driver: "Priya Sharma", phone: "+91 98765 43213", type: "Neonatal ICU", status: "available" },
];

router.get("/ambulance/status", requireAuth, async (_req, res): Promise<void> => {
  const randomize = (base: number, spread: number) => +(base + (Math.random() - 0.5) * spread).toFixed(1);

  const response = ambulances.map((amb, i) => ({
    ...amb,
    distanceKm: amb.status === "dispatched" ? randomize(1.2, 0.8) : randomize(3 + i * 1.5, 2),
    etaMinutes: amb.status === "dispatched" ? Math.ceil(randomize(4, 3)) : Math.ceil(randomize(8 + i * 3, 4)),
    lat: 28.6139 + (Math.random() - 0.5) * 0.05,
    lng: 77.2090 + (Math.random() - 0.5) * 0.05,
  }));

  res.json(response);
});

router.post("/ambulance/request", requireAuth, async (_req, res): Promise<void> => {
  const eta = Math.floor(Math.random() * 8) + 4;
  res.json({
    success: true,
    ambulanceId: "AMB-001",
    driver: "Rajesh Kumar",
    phone: "+91 98765 43210",
    etaMinutes: eta,
    message: `Ambulance dispatched. ETA: ${eta} minutes. Driver will contact you shortly.`,
    trackingId: `TRK-${Date.now()}`,
  });
});

export default router;
