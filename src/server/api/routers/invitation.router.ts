import { z } from "zod";

import { pusherChannels } from "~/pusher/channels";
import { pusher } from "~/pusher/server";
import { services } from "~/server/services/container";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const invitationRouter = createTRPCRouter({
  // Create a project invitation link (requires admin permission)
  create: authedProcedure.input(z.string()).mutation(async ({ input }) => {
    // Access services via the services object
    await services.authService.requireProjectAdmin(input);
    return services.invitationService.create(input);
  }),

  // Get an invitation by ID
  get: authedProcedure.input(z.string()).query(async ({ input }) => {
    // Access services via the services object
    return services.invitationService.get(input);
  }),

  // Accept an invitation to join a project
  accept: authedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    // Access services via the services object
    await services.invitationService.get(input);

    const projectUser = await services.invitationService.accept(
      input,
      ctx.userId,
    );

    await pusher.trigger(
      pusherChannels.projectUser.name,
      pusherChannels.projectUser.events.added.name,
      {
        input: projectUser,
        returning: projectUser,
        userId: ctx.userId,
      },
    );

    return projectUser;
  }),
});
