import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";

const JWT_EXPIRES_IN = "8h";

export function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

export function toPublicUser(user) {
  return {
    id: user._id,
    code: user.code,
    name: user.name,
    email: user.email,
    role: user.role,
    specialization: user.specialization,
    skills: user.skills,
  };
}

export async function login(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const token = signToken(user._id);
  return { token, user: toPublicUser(user) };
}

export async function getUserById(userId) {
  return User.findById(userId);
}
