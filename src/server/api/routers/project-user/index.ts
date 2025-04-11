import { z } from "zod";

import { pusherChannels } from "~/pusher/channels";
import { pusher } from "~/pusher/server";
import { services } from "~/server/services/container";
import { ProjectUserUpdateSchema } from "~/server/zod";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const projectUserRouter = createTRPCRouter({
  // List all users in a project (requires project membership)
  list: authedProcedure.input(z.string()).query(async ({ input }) => {
    // Access services via the services object
    await services.authService.canAccessProject(input);
    return services.projectUserService.list(input);
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
    .mutation(async ({ input, ctx }) => {
      // Access services via the services object
      await services.authService.requireProjectAdmin(input.projectId);

      const projectUser = await services.projectUserService.update(
        input.projectId,
        input.userId,
        input.data,
      );

      await pusher.trigger(
        pusherChannels.projectUser.name,
        pusherChannels.projectUser.events.updated.name,
        {
          input: projectUser,
          returning: projectUser,
          userId: ctx.userId,
        },
      );

      return projectUser;
    }),

  // Remove a user from a project (requires admin permission)
  remove: authedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Access services via the services object
      await services.authService.requireProjectAdmin(input.projectId);

      const projectUser =
        await services.projectUserService.getByProjectIdAndUserId(
          input.projectId,
          input.userId,
        );

      await services.projectUserService.remove(input.projectId, input.userId);

      await pusher.trigger(
        pusherChannels.projectUser.name,
        pusherChannels.projectUser.events.removed.name,
        {
          input: projectUser,
          returning: projectUser,
          userId: ctx.userId,
        },
      );

      return projectUser;
    }),

  // Update current user's project preferences (requires project membership)
  updateCurrentUserPreferences: authedProcedure
    .input(
      z.object({
        projectId: z.string(),
        data: z.object({
          isFavorite: z.boolean().optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Access services via the services object
      await services.authService.canAccessProject(input.projectId);
      const projectUser =
        await services.projectUserService.updateCurrentUserPreferences(
          input.projectId,
          input.data,
        );

      await pusher.trigger(
        pusherChannels.projectUser.name,
        pusherChannels.projectUser.events.updated.name,
        {
          input: projectUser,
          returning: projectUser,
          userId: ctx.userId,
        },
      );

      return projectUser;
    }),

  // Count users in a project (requires any access to project)
  countByProjectId: authedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      // Access services via the services object
      await services.authService.canAccessProject(input);
      return services.projectUserService.countByProjectId(input);
    }),

  // Get current user's membership in a project
  getCurrentProjectUser: authedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      // Access services via the services object
      await services.authService.canAccessProject(input);
      return services.projectUserService.getCurrentProjectUser(input);
    }),
});
