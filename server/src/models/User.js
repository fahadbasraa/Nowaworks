import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["ADMIN", "MANAGER", "AGENT"], required: true },
  specialization: { type: String },
  skills: { type: [String], default: [] },
});

export const User = mongoose.model("User", userSchema);
