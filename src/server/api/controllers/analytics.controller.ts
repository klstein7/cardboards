"use server";

import { analyticsService, projectUserService } from "~/server/services";

export async function getProjectProgress(projectId: string) {
  await projectUserService.getCurrentProjectUser(projectId);
  return analyticsService.getProjectProgress(projectId);
}

export async function getTaskCompletionTrend(projectId: string) {
  await projectUserService.getCurrentProjectUser(projectId);
  return analyticsService.getTaskCompletionTrend(projectId);
}

export async function getUserActivity(projectId: string) {
  await projectUserService.getCurrentProjectUser(projectId);
  return analyticsService.getUserActivity(projectId);
}
