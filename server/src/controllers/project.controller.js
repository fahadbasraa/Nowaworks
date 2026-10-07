import mongoose from "mongoose";
import { getProjects, getProjectById } from "../services/access.service.js";
import { AppError } from "../utils/AppError.js";

export async function listProjects(req, res, next) {
  try {
    const projects = await getProjects(req.user);
    res.json({ projects });
  } catch (err) {
    next(err);
  }
}

export async function getProject(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError(404, "NOT_FOUND", "Project not found");
    }

    const project = await getProjectById(req.user, id);
    if (!project) {
      throw new AppError(404, "NOT_FOUND", "Project not found");
    }

    res.json({ project });
  } catch (err) {
    next(err);
  }
}
