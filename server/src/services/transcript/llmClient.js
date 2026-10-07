import OpenAI from "openai";
import { env } from "../../config/env.js";
import { SYSTEM_PROMPT, SUBMIT_PLAN_TOOL } from "./prompt.js";
import { AppError } from "../../utils/AppError.js";

const TIMEOUT_MS = 60_000;

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

async function callOnce(userMessage) {
  const response = await client.chat.completions.create(
    {
      model: env.OPENAI_MODEL,
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      tools: [{ type: "function", function: SUBMIT_PLAN_TOOL }],
      tool_choice: { type: "function", function: { name: "submit_plan" } },
    },
    { timeout: TIMEOUT_MS }
  );

  const toolCall = response.choices[0]?.message?.tool_calls?.find((tc) => tc.function?.name === "submit_plan");
  if (!toolCall) {
    throw new AppError(502, "AI_BAD_RESPONSE", "The AI did not return a structured plan");
  }

  try {
    return JSON.parse(toolCall.function.arguments);
  } catch {
    throw new AppError(502, "AI_BAD_RESPONSE", "The AI returned malformed JSON");
  }
}

function isRetryable(err) {
  if (err instanceof OpenAI.APIConnectionError) return true;
  if (typeof err?.status === "number" && err.status >= 500) return true;
  if (err?.code === "ECONNRESET" || err?.code === "ETIMEDOUT") return true;
  return false;
}

export async function extractPlan(userMessage) {
  try {
    return await callOnce(userMessage);
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (isRetryable(err)) {
      try {
        return await callOnce(userMessage);
      } catch {
        throw new AppError(502, "AI_UNAVAILABLE", "The AI service is unavailable. Please try again.");
      }
    }
    throw new AppError(502, "AI_UNAVAILABLE", "The AI service is unavailable. Please try again.");
  }
}
