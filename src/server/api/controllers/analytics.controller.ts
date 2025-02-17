"use server";

import { analyticsService, authService } from "~/server/services";

export async function getProjectProgress(projectId: string) {
  await authService.getCurrentProjectUser(projectId);
  return analyticsService.getProjectProgress(projectId);
}

export async function getTaskCompletionTrend(projectId: string) {
  await authService.getCurrentProjectUser(projectId);
  return analyticsService.getTaskCompletionTrend(projectId);
}

export async function getUserActivity(projectId: string) {
  await authService.getCurrentProjectUser(projectId);
  return analyticsService.getUserActivity(projectId);
}
