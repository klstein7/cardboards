import { z } from "zod";

// Import the services object from container
// import { analyticsService, authService } from "~/server/services"; // Old import from index
import { services } from "~/server/services/container";
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
      // Access services via the services object
      await services.authService.canAccessProject(input.projectId);
      return services.analyticsService.getProjectProgress(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    }),

  // Get task completion trend over time (requires project membership)
  getTaskCompletionTrend: authedProcedure
    .input(analyticsInputSchema)
    .query(async ({ input }) => {
      // Access services via the services object
      await services.authService.canAccessProject(input.projectId);
      return services.analyticsService.getTaskCompletionTrend(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    }),

  // Get user activity statistics (requires project membership)
  getUserActivity: authedProcedure
    .input(analyticsInputSchema)
    .query(async ({ input }) => {
      // Access services via the services object
      await services.authService.canAccessProject(input.projectId);
      return services.analyticsService.getUserActivity(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    }),

  // Get task priority distribution (requires project membership)
  getPriorityDistribution: authedProcedure
    .input(analyticsInputSchema)
    .query(async ({ input }) => {
      // Access services via the services object
      await services.authService.canAccessProject(input.projectId);
      return services.analyticsService.getPriorityDistribution(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    }),

  // Get tasks grouped by due date (requires project membership)
  getTasksPerDueDate: authedProcedure
    .input(analyticsInputSchema)
    .query(async ({ input }) => {
      // Access services via the services object
      await services.authService.canAccessProject(input.projectId);
      return services.analyticsService.getTasksPerDueDate(
        input.projectId,
        input.startDate,
        input.endDate,
      );
    }),
});
