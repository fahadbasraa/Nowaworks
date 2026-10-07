import { extractPlan } from "./llmClient.js";
import { planSchema } from "./schema.js";
import { validatePlan } from "./validatePlan.js";
import { persistPlan } from "./persistPlan.js";
import { buildUserMessage, extractMeetingDate } from "./prompt.js";
import { getTeamDirectory } from "../access.service.js";
import { AppError } from "../../utils/AppError.js";

const MAX_TRANSCRIPT_LENGTH = 50_000;

export async function createFromTranscript(transcript, adminUser) {
  if (typeof transcript !== "string" || transcript.trim().length === 0) {
    throw new AppError(422, "PLAN_INVALID", "Transcript is required", [
      { path: "transcript", message: "Transcript must not be empty" },
    ]);
  }
  if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
    throw new AppError(422, "PLAN_INVALID", "Transcript is too long", [
      { path: "transcript", message: `Transcript must be at most ${MAX_TRANSCRIPT_LENGTH} characters` },
    ]);
  }

  const directory = await getTeamDirectory();
  const meetingDate = extractMeetingDate(transcript) ?? new Date().toISOString().slice(0, 10);
  const userMessage = buildUserMessage({ meetingDate, directory, transcript });

  const rawPlan = await extractPlan(userMessage);

  const parsed = planSchema.safeParse(rawPlan);
  if (!parsed.success) {
    throw new AppError(502, "AI_BAD_RESPONSE", "The AI returned an unexpected shape", parsed.error.issues);
  }
  const plan = parsed.data;

  const errors = validatePlan(plan, directory);
  if (errors.length > 0) {
    throw new AppError(422, "PLAN_INVALID", "The extracted plan has validation errors", errors, { draft: plan });
  }

  return persistPlan(plan, adminUser);
}
