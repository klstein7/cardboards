"use server";

import { authService, projectService } from "~/server/services";
import { type ProjectCreate, ProjectCreateSchema } from "~/server/zod";

export async function create(data: ProjectCreate) {
  const parsed = ProjectCreateSchema.parse(data);
  return projectService.create(parsed);
}

export async function list() {
  return projectService.list();
}

export async function get(projectId: string) {
  await authService.getCurrentProjectUser(projectId);
  return projectService.get(projectId);
}

export async function del(projectId: string) {
  await authService.requireProjectAdmin(projectId);
  return projectService.del(projectId);
}
