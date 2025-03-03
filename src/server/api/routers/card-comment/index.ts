import { z } from "zod";

import { authService, cardCommentService } from "~/server/services";
import { CardCommentCreateSchema, CardCommentUpdateSchema } from "~/server/zod";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const cardCommentRouter = createTRPCRouter({
  // Create a new card comment (requires card access)
  create: authedProcedure
    .input(CardCommentCreateSchema)
    .mutation(async ({ input }) => {
      // Verify user can access this card
      await authService.canAccessCard(input.cardId);
      return cardCommentService.create(input);
    }),

  // List comments for a card (requires card access)
  list: authedProcedure.input(z.number()).query(async ({ input }) => {
    // Verify user can access this card
    await authService.canAccessCard(input);
    return cardCommentService.list(input);
  }),

  // Remove a comment (requires access to the comment's card)
  remove: authedProcedure.input(z.string()).mutation(async ({ input }) => {
    // Get the comment first to verify the card relationship
    const comment = await cardCommentService.get(input);

    // Verify user can access the card this comment belongs to
    await authService.canAccessCard(comment.cardId);
    return cardCommentService.remove(input);
  }),

  // Update a comment (requires access to the comment's card)
  update: authedProcedure
    .input(CardCommentUpdateSchema)
    .mutation(async ({ input }) => {
      // Get the comment first to verify the card relationship
      const comment = await cardCommentService.get(input.cardCommentId);

      // Verify user can access the card this comment belongs to
      await authService.canAccessCard(comment.cardId);
      return cardCommentService.update(input.cardCommentId, input.data);
    }),
});
