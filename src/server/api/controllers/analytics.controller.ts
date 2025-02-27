"use server";

import { analyticsService, projectUserService } from "~/server/services";

export async function getProjectProgress(
  projectId: string,
  startDate?: Date,
  endDate?: Date,
) {
  await projectUserService.getCurrentProjectUser(projectId);
  return analyticsService.getProjectProgress(projectId, startDate, endDate);
}

export async function getTaskCompletionTrend(
  projectId: string,
  startDate?: Date,
  endDate?: Date,
) {
  await projectUserService.getCurrentProjectUser(projectId);
  return analyticsService.getTaskCompletionTrend(projectId, startDate, endDate);
}

export async function getUserActivity(
  projectId: string,
  startDate?: Date,
  endDate?: Date,
) {
  await projectUserService.getCurrentProjectUser(projectId);
  return analyticsService.getUserActivity(projectId, startDate, endDate);
}

export async function getPriorityDistribution(
  projectId: string,
  startDate?: Date,
  endDate?: Date,
) {
  await projectUserService.getCurrentProjectUser(projectId);
  return analyticsService.getPriorityDistribution(
    projectId,
    startDate,
    endDate,
  );
}

export async function getTasksPerDueDate(
  projectId: string,
  startDate?: Date,
  endDate?: Date,
) {
  await projectUserService.getCurrentProjectUser(projectId);
  return analyticsService.getTasksPerDueDate(projectId, startDate, endDate);
}
