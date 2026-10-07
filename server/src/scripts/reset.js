import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { resetDemoData } from "../services/demo.service.js";

async function reset() {
  await connectDB();

  const { deletedProjects, deletedTasks } = await resetDemoData();

  console.log(`Deleted ${deletedProjects} projects and ${deletedTasks} tasks. Users were kept.`);
  await mongoose.disconnect();
}

reset().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
