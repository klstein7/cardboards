"use server";

import { ProjectCreateSchema, type ProjectCreate } from "~/server/zod";
import { projectService } from "~/server/services";

export async function create(data: ProjectCreate) {
  return projectService.create(ProjectCreateSchema.parse(data));
}

export async function list() {
  return projectService.list();
}
