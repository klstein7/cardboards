import { z } from "zod";

import { analyticsService, projectUserService } from "~/server/services";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

// Define reusable input schema that includes projectId and date range
const analyticsInputSchema = z.object({
  projectId: z.string(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const analyticsRouter = createTRPCRouter({
  // Get project progress
  getProjectProgress: authedProcedure
    .input(analyticsInputSchema)
    .query(async ({ input }) => {
      await projectUserService.getCurrentProjectUser(input.projectId);
      return analyticsService.getProjectProgress(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    }),

  // Get task completion trend
  getTaskCompletionTrend: authedProcedure
    .input(analyticsInputSchema)
    .query(async ({ input }) => {
      await projectUserService.getCurrentProjectUser(input.projectId);
      return analyticsService.getTaskCompletionTrend(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    }),

  // Get user activity
  getUserActivity: authedProcedure
    .input(analyticsInputSchema)
    .query(async ({ input }) => {
      await projectUserService.getCurrentProjectUser(input.projectId);
      return analyticsService.getUserActivity(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    }),

  // Get priority distribution
  getPriorityDistribution: authedProcedure
    .input(analyticsInputSchema)
    .query(async ({ input }) => {
      await projectUserService.getCurrentProjectUser(input.projectId);
      return analyticsService.getPriorityDistribution(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    }),

  // Get tasks per due date
  getTasksPerDueDate: authedProcedure
    .input(analyticsInputSchema)
    .query(async ({ input }) => {
      await projectUserService.getCurrentProjectUser(input.projectId);
      return analyticsService.getTasksPerDueDate(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    }),
});
