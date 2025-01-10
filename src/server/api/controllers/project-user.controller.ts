"use server";

import { projectUserService } from "~/server/services";

export async function list(projectId: string) {
  return projectUserService.list(projectId);
}
