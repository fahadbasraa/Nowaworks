import { extractPlan } from "./llmClient.js";
import { planSchema } from "./schema.js";
import { validatePlan } from "./validatePlan.js";
import { persistPlan } from "./persistPlan.js";
import { buildUserMessage, extractMeetingDate } from "./prompt.js";
import { getTeamDirectory } from "../access.service.js";
import { AppError } from "../../utils/AppError.js";

const MAX_TRANSCRIPT_LENGTH = 50_000;

function assertTranscriptShape(transcript) {
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
}

// AI extraction + validation only — nothing is saved. The admin reviews (and may edit)
// the returned plan before it is sent to commitPlan.
export async function previewFromTranscript(transcript) {
  assertTranscriptShape(transcript);

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

  return {
    plan: { projects: plan.projects, unresolved: plan.unresolved },
    decisions: plan.decisions,
    errors,
  };
}

// Re-validates the (possibly admin-edited) plan from scratch against the live directory,
// then saves it. Never trusts validation already performed client-side or in preview.
export async function commitPlan(planInput, adminUser) {
  const parsed = planSchema.safeParse(planInput);
  if (!parsed.success) {
    throw new AppError(422, "PLAN_INVALID", "The plan has an unexpected shape", parsed.error.issues);
  }
  const plan = parsed.data;

  const directory = await getTeamDirectory();
  const errors = validatePlan(plan, directory);
  if (errors.length > 0) {
    throw new AppError(422, "PLAN_INVALID", "The plan has validation errors", errors, { draft: plan });
  }

  return persistPlan(plan, adminUser);
}
