import { api } from "./client.js";

export async function getTeam() {
  const { data } = await api.get("/team");
  return data.team;
}
