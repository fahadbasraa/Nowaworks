import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { listMyTasks } from "../controllers/task.controller.js";

const router = Router();

router.get("/mine", requireAuth, requireRole("AGENT"), listMyTasks);

export default router;
