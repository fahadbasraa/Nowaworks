import { api } from "./client.js";

export async function getProjects() {
  const { data } = await api.get("/projects");
  return data.projects;
}

export async function getProject(id) {
  const { data } = await api.get(`/projects/${id}`);
  return data.project;
}
