import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { transcriptRateLimit } from "../middleware/rateLimits.js";
import { postPreview, postCommit } from "../controllers/transcript.controller.js";

const router = Router();

router.post("/preview", requireAuth, requireRole("ADMIN"), transcriptRateLimit, postPreview);
router.post("/commit", requireAuth, requireRole("ADMIN"), transcriptRateLimit, postCommit);

export default router;
