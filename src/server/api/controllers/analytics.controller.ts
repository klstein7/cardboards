"use server";

import { analyticsService } from "~/server/services";

export async function getProjectProgress(projectId: string) {
  return analyticsService.getProjectProgress(projectId);
}

export async function getTaskCompletionTrend(projectId: string) {
  return analyticsService.getTaskCompletionTrend(projectId);
}

export async function getUserActivity(projectId: string) {
  return analyticsService.getUserActivity(projectId);
}
