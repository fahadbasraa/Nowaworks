import { resetDemoData } from "../services/demo.service.js";

export async function postResetDemo(req, res, next) {
  try {
    const result = await resetDemoData();
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
}
