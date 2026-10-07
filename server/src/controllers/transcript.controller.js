import { z } from "zod";
import { createFromTranscript } from "../services/transcript/index.js";
import { AppError } from "../utils/AppError.js";

const bodySchema = z.object({
  transcript: z.string(),
});

export async function postTranscript(req, res, next) {
  try {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(422, "PLAN_INVALID", "A transcript string is required", parsed.error.issues);
    }

    const summary = await createFromTranscript(parsed.data.transcript, req.user);
    res.status(201).json(summary);
  } catch (err) {
    next(err);
  }
}
