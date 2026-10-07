import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { listProjects, getProject } from "../controllers/project.controller.js";

const router = Router();

router.use(requireAuth);
router.get("/", listProjects);
router.get("/:id", getProject);

export default router;
