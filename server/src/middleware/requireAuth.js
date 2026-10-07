import { verifyToken, getUserById } from "../services/auth.service.js";
import { AppError } from "../utils/AppError.js";

const UNAUTHENTICATED = () => new AppError(401, "UNAUTHENTICATED", "Login required");

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) throw UNAUTHENTICATED();

    const payload = verifyToken(token);
    const user = await getUserById(payload.sub);
    if (!user) throw UNAUTHENTICATED();

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(UNAUTHENTICATED());
  }
}
