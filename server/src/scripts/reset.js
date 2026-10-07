import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";

async function reset() {
  await connectDB();

  const { deletedCount: taskCount } = await Task.deleteMany({});
  const { deletedCount: projectCount } = await Project.deleteMany({});

  console.log(`Deleted ${projectCount} projects and ${taskCount} tasks. Users were kept.`);
  await mongoose.disconnect();
}

reset().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
