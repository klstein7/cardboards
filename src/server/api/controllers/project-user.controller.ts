"use server";

import { authService, projectUserService } from "~/server/services";
import { type ProjectUserUpdate } from "~/server/zod";

export async function list(projectId: string) {
  await projectUserService.getCurrentProjectUser(projectId);
  return projectUserService.list(projectId);
}

export async function update({ projectId, userId, data }: ProjectUserUpdate) {
  await authService.requireProjectAdmin(projectId);
  return projectUserService.update(projectId, userId, data);
}

export async function countByProjectId(projectId: string) {
  await authService.canAccessProject(projectId);
  return projectUserService.countByProjectId(projectId);
}

export async function getCurrentProjectUser(projectId: string) {
  return projectUserService.getCurrentProjectUser(projectId);
}
