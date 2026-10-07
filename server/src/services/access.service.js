import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";

function toPublicTask(task) {
  return {
    id: task._id,
    title: task.title,
    description: task.description,
    assignee: { id: task.assignee._id, name: task.assignee.name },
    deadline: task.deadline,
    estimatedHours: task.estimatedHours,
  };
}

function buildTaskFilter(user, projectId) {
  if (user.role === "AGENT") {
    return { project: projectId, assignee: user._id };
  }
  return { project: projectId };
}

async function isProjectInScope(user, project) {
  if (user.role === "ADMIN") return true;
  if (user.role === "MANAGER") {
    return String(project.manager._id ?? project.manager) === String(user._id);
  }
  const count = await Task.countDocuments({ project: project._id, assignee: user._id });
  return count > 0;
}

export async function getProjects(user) {
  let filter = {};
  if (user.role === "MANAGER") {
    filter = { manager: user._id };
  } else if (user.role === "AGENT") {
    const projectIds = await Task.distinct("project", { assignee: user._id });
    filter = { _id: { $in: projectIds } };
  }

  const projects = await Project.find(filter).sort({ createdAt: -1 }).populate("manager", "name").lean();

  const results = [];
  for (const project of projects) {
    const tasks = await Task.find(buildTaskFilter(user, project._id)).lean();
    results.push({
      id: project._id,
      name: project.name,
      clientName: project.clientName,
      description: project.description,
      manager: { id: project.manager._id, name: project.manager.name },
      deadline: project.deadline,
      taskCount: tasks.length,
      totalHours: tasks.reduce((sum, t) => sum + t.estimatedHours, 0),
    });
  }
  return results;
}

export async function getProjectById(user, projectId) {
  if (!mongoose.isValidObjectId(projectId)) return null;

  const project = await Project.findById(projectId).populate("manager", "name").lean();
  if (!project) return null;

  const allowed = await isProjectInScope(user, project);
  if (!allowed) return null;

  const tasks = await Task.find(buildTaskFilter(user, project._id))
    .populate("assignee", "name")
    .sort({ deadline: 1 })
    .lean();

  return {
    id: project._id,
    name: project.name,
    clientName: project.clientName,
    description: project.description,
    manager: { id: project.manager._id, name: project.manager.name },
    deadline: project.deadline,
    tasks: tasks.map(toPublicTask),
  };
}

export async function getMyTasks(user) {
  const tasks = await Task.find({ assignee: user._id })
    .populate({
      path: "project",
      select: "name manager deadline",
      populate: { path: "manager", select: "name" },
    })
    .sort({ deadline: 1 })
    .lean();

  return tasks.map((task) => ({
    id: task._id,
    title: task.title,
    description: task.description,
    deadline: task.deadline,
    estimatedHours: task.estimatedHours,
    project: {
      id: task.project._id,
      name: task.project.name,
      deadline: task.project.deadline,
      manager: task.project.manager
        ? { id: task.project.manager._id, name: task.project.manager.name }
        : null,
    },
  }));
}

export async function getTeamDirectory() {
  const users = await User.find({}).sort({ role: 1, name: 1 }).lean();
  return users.map((u) => ({
    code: u.code,
    name: u.name,
    role: u.role,
    specialization: u.specialization,
    skills: u.skills,
  }));
}
