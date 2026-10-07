import { getTeamDirectory } from "../services/access.service.js";

export async function listTeam(req, res, next) {
  try {
    const team = await getTeamDirectory();
    res.json({ team });
  } catch (err) {
    next(err);
  }
}
