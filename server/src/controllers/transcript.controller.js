import { z } from "zod";
import { previewFromTranscript, commitPlan } from "../services/transcript/index.js";
import { AppError } from "../utils/AppError.js";

const previewSchema = z.object({
  transcript: z.string(),
});

export async function postPreview(req, res, next) {
  try {
    const parsed = previewSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(422, "PLAN_INVALID", "A transcript string is required", parsed.error.issues);
    }

    const preview = await previewFromTranscript(parsed.data.transcript);
    res.json(preview);
  } catch (err) {
    next(err);
  }
}

export async function postCommit(req, res, next) {
  try {
    const summary = await commitPlan(req.body, req.user);
    res.status(201).json(summary);
  } catch (err) {
    next(err);
  }
}
