import { api } from "./client.js";

export async function previewTranscript(transcript) {
  const { data } = await api.post("/transcript/preview", { transcript });
  return data;
}

export async function commitPlan(plan) {
  const { data } = await api.post("/transcript/commit", plan);
  return data;
}

export async function loadSampleTranscript() {
  const res = await fetch("/sample-transcript.txt");
  return res.text();
}

export async function loadModifiedTranscript() {
  const res = await fetch("/modified-transcript.txt");
  return res.text();
}
