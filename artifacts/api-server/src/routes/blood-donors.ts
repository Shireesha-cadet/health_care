import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

const donors = [
  { id: 1, name: "Arjun Mehta", bloodGroup: "A+", city: "Delhi", lastDonated: "2026-03-15", units: 2, phone: "+91 98765 10001", available: true, age: 28, donations: 7 },
  { id: 2, name: "Priya Sharma", bloodGroup: "B+", city: "Mumbai", lastDonated: "2026-04-02", units: 1, phone: "+91 98765 10002", available: true, age: 34, donations: 12 },
  { id: 3, name: "Rahul Verma", bloodGroup: "O+", city: "Delhi", lastDonated: "2026-01-20", units: 3, phone: "+91 98765 10003", available: true, age: 25, donations: 4 },
  { id: 4, name: "Sneha Patel", bloodGroup: "AB+", city: "Bangalore", lastDonated: "2026-02-28", units: 1, phone: "+91 98765 10004", available: false, age: 30, donations: 9 },
  { id: 5, name: "Kiran Nair", bloodGroup: "O-", city: "Chennai", lastDonated: "2026-03-30", units: 2, phone: "+91 98765 10005", available: true, age: 22, donations: 2 },
  { id: 6, name: "Amit Gupta", bloodGroup: "A-", city: "Hyderabad", lastDonated: "2026-04-10", units: 1, phone: "+91 98765 10006", available: true, age: 45, donations: 18 },
  { id: 7, name: "Divya Rao", bloodGroup: "B-", city: "Pune", lastDonated: "2026-02-14", units: 2, phone: "+91 98765 10007", available: true, age: 27, donations: 6 },
  { id: 8, name: "Vikram Singh", bloodGroup: "AB-", city: "Delhi", lastDonated: "2026-03-05", units: 1, phone: "+91 98765 10008", available: true, age: 38, donations: 14 },
  { id: 9, name: "Anjali Kumar", bloodGroup: "A+", city: "Mumbai", lastDonated: "2026-04-18", units: 2, phone: "+91 98765 10009", available: true, age: 31, donations: 5 },
  { id: 10, name: "Suresh Iyer", bloodGroup: "O+", city: "Bangalore", lastDonated: "2026-03-22", units: 1, phone: "+91 98765 10010", available: false, age: 42, donations: 21 },
  { id: 11, name: "Meera Joshi", bloodGroup: "B+", city: "Pune", lastDonated: "2026-04-01", units: 3, phone: "+91 98765 10011", available: true, age: 26, donations: 3 },
  { id: 12, name: "Rohan Das", bloodGroup: "O-", city: "Delhi", lastDonated: "2026-01-10", units: 2, phone: "+91 98765 10012", available: true, age: 35, donations: 11 },
];

router.get("/blood-donors", requireAuth, async (req, res): Promise<void> => {
  const { bloodGroup, city } = req.query;
  let filtered = donors;
  if (bloodGroup && typeof bloodGroup === "string") {
    filtered = filtered.filter(d => d.bloodGroup === bloodGroup);
  }
  if (city && typeof city === "string") {
    filtered = filtered.filter(d => d.city.toLowerCase().includes(city.toLowerCase()));
  }
  res.json(filtered);
});

router.post("/blood-donors/request", requireAuth, async (req, res): Promise<void> => {
  const { bloodGroup, city, unitsNeeded } = req.body;
  const matched = donors.filter(d => d.bloodGroup === bloodGroup && d.available);
  res.json({
    success: true,
    message: `Blood request submitted for ${unitsNeeded || 1} unit(s) of ${bloodGroup} in ${city}. ${matched.length} donors have been notified.`,
    matchedDonors: matched.length,
    requestId: `BLD-${Date.now()}`,
  });
});

export default router;
