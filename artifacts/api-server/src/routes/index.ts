import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import vitalsRouter from "./vitals";
import alertsRouter from "./alerts";
import appointmentsRouter from "./appointments";
import analyticsRouter from "./analytics";
import patientsRouter from "./patients";
import hospitalsRouter from "./hospitals";
import aiRouter from "./ai";
import insightsRouter from "./insights";
import schemesRouter from "./schemes";
import ambulanceRouter from "./ambulance";
import bloodDonorsRouter from "./blood-donors";
import reportRouter from "./report";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(vitalsRouter);
router.use(alertsRouter);
router.use(appointmentsRouter);
router.use(analyticsRouter);
router.use(patientsRouter);
router.use(hospitalsRouter);
router.use(aiRouter);
router.use(insightsRouter);
router.use(schemesRouter);
router.use(ambulanceRouter);
router.use(bloodDonorsRouter);
router.use(reportRouter);

export default router;
