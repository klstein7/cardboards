import { z } from "zod";

import { projectUserService } from "~/server/services";
import { ProjectUserUpdateSchema } from "~/server/zod";
import {
  createTRPCRouter,
  projectAdminByIdProcedure,
  projectAdminProcedure,
  projectByIdProcedure,
  projectMemberByIdProcedure,
} from "~/trpc/init";

export const projectUserRouter = createTRPCRouter({
  // List project users
  list: projectMemberByIdProcedure.query(({ ctx }) => {
    return projectUserService.list(ctx.projectId);
  }),

  // Update a project user
  update: projectAdminProcedure
    .input(
      z.object({
        userId: z.string(),
        data: ProjectUserUpdateSchema.shape.data,
      }),
    )
    .mutation(({ ctx, input }) => {
      return projectUserService.update(ctx.projectId, input.userId, input.data);
    }),

  // Count users by project ID
  countByProjectId: projectByIdProcedure.query(({ ctx }) => {
    return projectUserService.countByProjectId(ctx.projectId);
  }),

  // Get current project user
  getCurrentProjectUser: projectMemberByIdProcedure.query(({ ctx }) => {
    return projectUserService.getCurrentProjectUser(ctx.projectId);
  }),
});
