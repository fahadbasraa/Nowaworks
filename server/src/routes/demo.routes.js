import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { postResetDemo } from "../controllers/demo.controller.js";

const router = Router();

router.post("/reset", requireAuth, requireRole("ADMIN"), postResetDemo);

export default router;
