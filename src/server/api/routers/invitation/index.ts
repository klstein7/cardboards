import { invitationService } from "~/server/services";
import {
  createTRPCRouter,
  invitationByIdProcedure,
  projectAdminByIdProcedure,
} from "~/trpc/init";

export const invitationRouter = createTRPCRouter({
  // Create a new invitation
  create: projectAdminByIdProcedure.mutation(({ ctx }) => {
    return invitationService.create(ctx.projectId);
  }),

  // Get an invitation by ID
  get: invitationByIdProcedure.query(({ ctx }) => {
    return ctx.invitation; // Return the invitation from context
  }),

  // Accept an invitation
  accept: invitationByIdProcedure.mutation(({ ctx }) => {
    if (!ctx.userId) {
      throw new Error("Unauthorized");
    }
    return invitationService.accept(ctx.invitationId, ctx.userId);
  }),
});
