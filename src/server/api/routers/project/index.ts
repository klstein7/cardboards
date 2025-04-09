import { z } from "zod";

import { pusherChannels } from "~/pusher/channels";
import { pusher } from "~/pusher/server";
import { authService, projectService } from "~/server/services";
import { ProjectCreateSchema, ProjectUpdatePayloadSchema } from "~/server/zod";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const projectRouter = createTRPCRouter({
  create: authedProcedure
    .input(ProjectCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const project = await projectService.create(input);

      await pusher.trigger(
        pusherChannels.project.name,
        pusherChannels.project.events.created.name,
        {
          input: project,
          returning: project,
          userId: ctx.userId,
        },
      );

      return project;
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
    .mutation(async ({ input, ctx }) => {
      await authService.requireProjectAdmin(input.projectId);
      const project = await projectService.update(input.projectId, input.data);

      await pusher.trigger(
        pusherChannels.project.name,
        pusherChannels.project.events.updated.name,
        {
          input: {
            projectId: input.projectId,
            data: input.data,
          },
          returning: project,
          userId: ctx.userId,
        },
      );

      return project;
    }),

  delete: authedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    await authService.requireProjectAdmin(input);
    const project = await projectService.del(input);

    await pusher.trigger(
      pusherChannels.project.name,
      pusherChannels.project.events.deleted.name,
      {
        input,
        returning: project,
        userId: ctx.userId,
      },
    );

    return project;
  }),
});
