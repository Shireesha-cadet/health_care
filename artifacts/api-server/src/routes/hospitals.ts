import { Router, type IRouter } from "express";
import { db, hospitalsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/hospitals", requireAuth, async (_req, res): Promise<void> => {
  const hospitals = await db.select().from(hospitalsTable);
  res.json(hospitals);
});

export default router;
