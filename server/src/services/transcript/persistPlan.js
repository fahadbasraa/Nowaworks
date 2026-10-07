import mongoose from "mongoose";
import { User } from "../../models/User.js";
import { Project } from "../../models/Project.js";
import { Task } from "../../models/Task.js";
import { parseDateOnly } from "../../utils/dates.js";
import { AppError } from "../../utils/AppError.js";

export async function persistPlan(plan, adminUser) {
  const codes = new Set();
  plan.projects.forEach((p) => {
    codes.add(p.managerId);
    p.tasks.forEach((t) => codes.add(t.assigneeId));
  });

  const users = await User.find({ code: { $in: [...codes] } });
  const idByCode = new Map(users.map((u) => [u.code, u._id]));

  for (const project of plan.projects) {
    const exists = await Project.exists({ name: project.name, clientName: project.clientName });
    if (exists) {
      throw new AppError(
        409,
        "DUPLICATE_PROJECT",
        `A project named "${project.name}" for client "${project.clientName}" already exists. Run reset for a clean demo.`
      );
    }
  }

  const session = await mongoose.startSession();
  const createdProjects = [];

  try {
    await session.withTransaction(async () => {
      for (const project of plan.projects) {
        const [proj] = await Project.create(
          [
            {
              name: project.name,
              clientName: project.clientName,
              description: project.description,
              manager: idByCode.get(project.managerId),
              deadline: parseDateOnly(project.deadline),
              createdBy: adminUser._id,
            },
          ],
          { session }
        );

        const tasks = await Task.insertMany(
          project.tasks.map((task) => ({
            project: proj._id,
            title: task.title,
            description: task.description,
            assignee: idByCode.get(task.assigneeId),
            deadline: parseDateOnly(task.deadline),
            estimatedHours: task.estimatedHours,
          })),
          { session }
        );

        createdProjects.push({
          id: proj._id,
          name: proj.name,
          taskCount: tasks.length,
          totalHours: tasks.reduce((sum, t) => sum + t.estimatedHours, 0),
        });
      }
    });
  } finally {
    await session.endSession();
  }

  return {
    projects: createdProjects,
    totalTasks: createdProjects.reduce((sum, p) => sum + p.taskCount, 0),
    totalHours: createdProjects.reduce((sum, p) => sum + p.totalHours, 0),
  };
}
