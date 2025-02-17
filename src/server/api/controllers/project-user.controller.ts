"use server";

import { authService, projectUserService } from "~/server/services";
import { type ProjectUserUpdate } from "~/server/zod";

export async function list(projectId: string) {
  await authService.getCurrentProjectUser(projectId);
  return projectUserService.list(projectId);
}

export async function update({ projectId, userId, data }: ProjectUserUpdate) {
  await authService.requireProjectAdmin(projectId);
  return projectUserService.update(projectId, userId, data);
}
