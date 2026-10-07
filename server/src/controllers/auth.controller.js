import { z } from "zod";
import { env } from "../config/env.js";
import { login, toPublicUser } from "../services/auth.service.js";
import { AppError } from "../utils/AppError.js";

const COOKIE_NAME = "token";
const COOKIE_MAX_AGE_MS = 8 * 60 * 60 * 1000;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
  };
}

export async function loginHandler(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(422, "VALIDATION_ERROR", "Invalid email or password format", parsed.error.issues);
    }

    const { email, password } = parsed.data;
    const { token, user } = await login(email, password);

    res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: COOKIE_MAX_AGE_MS });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export function logoutHandler(req, res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  res.json({ ok: true });
}

export function meHandler(req, res) {
  res.json({ user: toPublicUser(req.user) });
}
