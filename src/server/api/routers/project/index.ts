import { z } from "zod";

import {
  authService,
  projectService,
  projectUserService,
} from "~/server/services";
import { ProjectCreateSchema, ProjectUpdatePayloadSchema } from "~/server/zod";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const projectRouter = createTRPCRouter({
  // Create a new project
  create: authedProcedure
    .input(ProjectCreateSchema)
    .mutation(async ({ input }) => {
      return projectService.create(input);
    }),

  // List all projects for the current user
  list: authedProcedure.query(() => {
    return projectService.list();
  }),

  // Get a specific project (requires membership)
  get: authedProcedure.input(z.string()).query(async ({ input }) => {
    // Verify user is a member of this project
    await projectUserService.getCurrentProjectUser(input);
    return projectService.get(input);
  }),

  // Update a project (requires admin permission)
  update: authedProcedure
    .input(
      z.object({
        data: ProjectUpdatePayloadSchema,
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      // Verify current user is a project admin
      await authService.requireProjectAdmin(input.projectId);
      return projectService.update(input.projectId, input.data);
    }),

  // Delete a project (requires admin permission)
  delete: authedProcedure.input(z.string()).mutation(async ({ input }) => {
    // Verify current user is a project admin
    await authService.requireProjectAdmin(input);
    return projectService.del(input);
  }),
});
