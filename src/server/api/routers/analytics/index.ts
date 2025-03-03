import { z } from "zod";

import { analyticsService, projectUserService } from "~/server/services";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

// Define reusable input schema for analytics queries
const analyticsInputSchema = z.object({
  projectId: z.string(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const analyticsRouter = createTRPCRouter({
  // Get project progress metrics (requires project membership)
  getProjectProgress: authedProcedure
    .input(analyticsInputSchema)
    .query(async ({ input }) => {
      // Verify user is a member of this project
      await projectUserService.getCurrentProjectUser(input.projectId);
      return analyticsService.getProjectProgress(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    }),

  // Get task completion trend over time (requires project membership)
  getTaskCompletionTrend: authedProcedure
    .input(analyticsInputSchema)
    .query(async ({ input }) => {
      // Verify user is a member of this project
      await projectUserService.getCurrentProjectUser(input.projectId);
      return analyticsService.getTaskCompletionTrend(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    }),

  // Get user activity statistics (requires project membership)
  getUserActivity: authedProcedure
    .input(analyticsInputSchema)
    .query(async ({ input }) => {
      // Verify user is a member of this project
      await projectUserService.getCurrentProjectUser(input.projectId);
      return analyticsService.getUserActivity(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    }),

  // Get task priority distribution (requires project membership)
  getPriorityDistribution: authedProcedure
    .input(analyticsInputSchema)
    .query(async ({ input }) => {
      // Verify user is a member of this project
      await projectUserService.getCurrentProjectUser(input.projectId);
      return analyticsService.getPriorityDistribution(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    }),

  // Get tasks grouped by due date (requires project membership)
  getTasksPerDueDate: authedProcedure
    .input(analyticsInputSchema)
    .query(async ({ input }) => {
      // Verify user is a member of this project
      await projectUserService.getCurrentProjectUser(input.projectId);
      return analyticsService.getTasksPerDueDate(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    }),
});
