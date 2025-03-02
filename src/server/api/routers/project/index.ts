import { projectService } from "~/server/services";
import { ProjectCreateSchema } from "~/server/zod";
import {
  authedProcedure,
  createTRPCRouter,
  projectAdminByIdProcedure,
  projectMemberByIdProcedure,
} from "~/trpc/init";

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

  // Get a specific project
  get: projectMemberByIdProcedure.query(({ ctx }) => {
    return projectService.get(ctx.projectId);
  }),

  // Delete a project - requires admin permission
  delete: projectAdminByIdProcedure.mutation(({ ctx }) => {
    return projectService.del(ctx.projectId);
  }),
});
