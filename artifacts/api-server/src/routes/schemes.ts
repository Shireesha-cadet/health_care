import { Router, type IRouter } from "express";

const router: IRouter = Router();

const govtSchemes = [
  {
    id: 1,
    title: "Ayushman Bharat – PM-JAY",
    ministry: "Ministry of Health & Family Welfare",
    tag: "Health Insurance",
    description: "World's largest government-funded health insurance scheme providing coverage up to ₹5 lakh per family per year for secondary and tertiary care hospitalization.",
    eligibility: "Families covered under SECC database and RSBY beneficiaries",
    benefits: ["₹5 lakh health cover per family/year", "Cashless treatment at 25,000+ hospitals", "Covers 1,929 medical procedures", "No cap on family size"],
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
    color: "blue",
    applyUrl: "https://pmjay.gov.in",
  },
  {
    id: 2,
    title: "Pradhan Mantri Suraksha Bima Yojana",
    ministry: "Ministry of Finance",
    tag: "Accident Insurance",
    description: "Accidental death and disability insurance scheme offering coverage of ₹2 lakh for accidental death at a premium of just ₹20/year.",
    eligibility: "Age 18-70, bank account with Aadhaar link",
    benefits: ["₹2 lakh accidental death cover", "₹1 lakh partial disability cover", "Annual premium of ₹20 only", "Auto-debit from bank account"],
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
    color: "green",
    applyUrl: "https://financialservices.gov.in",
  },
  {
    id: 3,
    title: "National Health Mission (NHM)",
    ministry: "Ministry of Health & Family Welfare",
    tag: "Primary Healthcare",
    description: "Comprehensive mission to strengthen healthcare delivery in rural and urban areas, improving maternal and child health outcomes across India.",
    eligibility: "All Indian citizens, priority for BPL families",
    benefits: ["Free maternal & child health services", "Free immunization", "Free diagnosis & treatment at govt. hospitals", "Mobile health units in remote areas"],
    image: "https://images.unsplash.com/photo-1631815588090-d1bcbe9b4b38?w=600&q=80",
    color: "purple",
    applyUrl: "https://nhm.gov.in",
  },
  {
    id: 4,
    title: "Janani Suraksha Yojana",
    ministry: "Ministry of Health & Family Welfare",
    tag: "Maternal Health",
    description: "Safe motherhood intervention promoting institutional delivery among poor pregnant women by providing direct cash incentives for hospital births.",
    eligibility: "Pregnant women from BPL households",
    benefits: ["Cash incentive for institutional delivery", "Free ANC check-ups", "Free transport to hospital", "Post-delivery care support"],
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80",
    color: "pink",
    applyUrl: "https://nhm.gov.in/jsy",
  },
  {
    id: 5,
    title: "Rashtriya Arogya Nidhi",
    ministry: "Ministry of Health & Family Welfare",
    tag: "Critical Illness",
    description: "Financial assistance to BPL patients suffering from major life-threatening diseases for treatment at Government hospitals.",
    eligibility: "BPL patients with life-threatening diseases",
    benefits: ["Financial aid up to ₹15 lakh", "Covers heart, cancer, kidney diseases", "Treatment at super-specialty govt. hospitals", "Quick approval process"],
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&q=80",
    color: "red",
    applyUrl: "https://mohfw.gov.in",
  },
  {
    id: 6,
    title: "PM National Dialysis Programme",
    ministry: "Ministry of Health & Family Welfare",
    tag: "Dialysis Support",
    description: "Provides free dialysis services to poor patients with kidney failure at district hospitals under PPP model.",
    eligibility: "BPL patients requiring dialysis",
    benefits: ["Free dialysis sessions", "Available at 700+ district hospitals", "Covers consumables & medicines", "Transportation support"],
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&q=80",
    color: "teal",
    applyUrl: "https://nhm.gov.in/dialysis",
  },
];

router.get("/schemes", async (_req, res): Promise<void> => {
  res.json(govtSchemes);
});

export default router;
