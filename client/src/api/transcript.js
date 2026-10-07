import { api } from "./client.js";

export async function createFromTranscript(transcript) {
  const { data } = await api.post("/transcript", { transcript });
  return data;
}

export async function loadSampleTranscript() {
  const res = await fetch("/sample-transcript.txt");
  return res.text();
}
