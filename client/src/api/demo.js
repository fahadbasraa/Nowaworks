import { api } from "./client.js";

export async function resetDemoData() {
  const { data } = await api.post("/demo/reset");
  return data;
}
