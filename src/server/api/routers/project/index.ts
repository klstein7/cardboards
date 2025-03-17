import { z } from "zod";

import { authService, projectService } from "~/server/services";
import { ProjectCreateSchema, ProjectUpdatePayloadSchema } from "~/server/zod";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const projectRouter = createTRPCRouter({
  create: authedProcedure
    .input(ProjectCreateSchema)
    .mutation(async ({ input }) => {
      return projectService.create(input);
    }),

  list: authedProcedure.query(() => {
    return projectService.list();
  }),

  get: authedProcedure.input(z.string()).query(async ({ input }) => {
    await authService.canAccessProject(input);
    return projectService.get(input);
  }),

  update: authedProcedure
    .input(
      z.object({
        data: ProjectUpdatePayloadSchema,
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await authService.requireProjectAdmin(input.projectId);
      return projectService.update(input.projectId, input.data);
    }),

  delete: authedProcedure.input(z.string()).mutation(async ({ input }) => {
    await authService.requireProjectAdmin(input);
    return projectService.del(input);
  }),
});
