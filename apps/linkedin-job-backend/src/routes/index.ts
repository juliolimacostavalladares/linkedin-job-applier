import { Router } from "express";
import configRouter from "./config";
import credentialsRouter from "./credentials";
import jobsRouter from "./jobs";
import resumeRouter from "./resume";
import aiRouter from "./ai";
import applicationsRouter from "./applications";

const router = Router();

// GET /api/config
router.use("/config", configRouter);

// GET /api/credentials/status  |  POST /api/credentials
router.use("/credentials", credentialsRouter);

// GET /api/jobs  |  GET /api/jobs/:id  |  GET /api/jobs/:id/apply-form
router.use("/jobs", jobsRouter);

// POST /api/posts
// GET /api/applications
router.use("/applications", applicationsRouter);

// POST /api/resume/from-linkedin
router.use("/resume", resumeRouter);

// POST /api/generate-answers
router.use("/", aiRouter);

export default router;
