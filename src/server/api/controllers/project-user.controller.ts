"use server";

import { projectUserService } from "~/server/services";
import { type ProjectUserUpdate } from "~/server/zod";

export async function list(projectId: string) {
  return projectUserService.list(projectId);
}

export async function update({ projectId, userId, data }: ProjectUserUpdate) {
  return projectUserService.update(projectId, userId, data);
}
