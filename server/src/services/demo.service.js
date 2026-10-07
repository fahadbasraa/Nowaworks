import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";

export async function resetDemoData() {
  const { deletedCount: deletedTasks } = await Task.deleteMany({});
  const { deletedCount: deletedProjects } = await Project.deleteMany({});
  return { deletedProjects, deletedTasks };
}
