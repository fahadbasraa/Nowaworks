import { api } from "./client.js";

export async function getMyTasks() {
  const { data } = await api.get("/tasks/mine");
  return data.tasks;
}
