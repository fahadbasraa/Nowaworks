import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { listTeam } from "../controllers/team.controller.js";

const router = Router();

router.get("/", requireAuth, listTeam);

export default router;
