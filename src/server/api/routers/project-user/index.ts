import { z } from "zod";

import { authService, projectUserService } from "~/server/services";
import { ProjectUserUpdateSchema } from "~/server/zod";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const projectUserRouter = createTRPCRouter({
  // List all users in a project (requires project membership)
  list: authedProcedure.input(z.string()).query(async ({ input }) => {
    // Verify user can access this project
    await authService.canAccessProject(input);
    return projectUserService.list(input);
  }),

  // Update a project user (requires admin permission)
  update: authedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
        data: ProjectUserUpdateSchema.shape.data,
      }),
    )
    .mutation(async ({ input }) => {
      // Verify current user is a project admin
      await authService.requireProjectAdmin(input.projectId);

      return projectUserService.update(
        input.projectId,
        input.userId,
        input.data,
      );
    }),

  // Count users in a project (requires any access to project)
  countByProjectId: authedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      // Verify user can access this project
      await authService.canAccessProject(input);
      return projectUserService.countByProjectId(input);
    }),

  // Get current user's membership in a project
  getCurrentProjectUser: authedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      // Verify user can access this project
      await authService.canAccessProject(input);
      return projectUserService.getCurrentProjectUser(input);
    }),
});
