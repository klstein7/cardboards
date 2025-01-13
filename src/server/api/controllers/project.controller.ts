"use server";

import { projectService } from "~/server/services";
import { type ProjectCreate, ProjectCreateSchema } from "~/server/zod";

export async function create(data: ProjectCreate) {
  return projectService.create(ProjectCreateSchema.parse(data));
}

export async function list() {
  return projectService.list();
}

export async function get(projectId: string) {
  return projectService.get(projectId);
}
