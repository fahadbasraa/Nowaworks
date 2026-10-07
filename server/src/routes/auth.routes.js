import { Router } from "express";
import { loginHandler, logoutHandler, meHandler } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { loginRateLimit } from "../middleware/rateLimits.js";

const router = Router();

router.post("/login", loginRateLimit, loginHandler);
router.post("/logout", logoutHandler);
router.get("/me", requireAuth, meHandler);

export default router;
