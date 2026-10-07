import { getMyTasks } from "../services/access.service.js";

export async function listMyTasks(req, res, next) {
  try {
    const tasks = await getMyTasks(req.user);
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}
