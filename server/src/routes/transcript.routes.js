import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { transcriptRateLimit } from "../middleware/rateLimits.js";
import { postTranscript } from "../controllers/transcript.controller.js";

const router = Router();

router.post("/", requireAuth, requireRole("ADMIN"), transcriptRateLimit, postTranscript);

export default router;
