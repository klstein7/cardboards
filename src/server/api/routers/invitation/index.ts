import { z } from "zod";

import { authService, invitationService } from "~/server/services";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const invitationRouter = createTRPCRouter({
  // Create a project invitation link (requires admin permission)
  create: authedProcedure.input(z.string()).mutation(async ({ input }) => {
    // Verify current user is a project admin
    await authService.requireProjectAdmin(input);
    return invitationService.create(input);
  }),

  // Get an invitation by ID
  get: authedProcedure.input(z.string()).query(async ({ input }) => {
    return invitationService.get(input);
  }),

  // Accept an invitation to join a project
  accept: authedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    // Get invitation first to verify it exists
    await invitationService.get(input);

    return invitationService.accept(input, ctx.userId);
  }),
});
