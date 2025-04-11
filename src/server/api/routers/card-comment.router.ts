import { z } from "zod";

// Import the services object from container
// import { authService, cardCommentService } from "~/server/services"; // Old import from index
import { services } from "~/server/services/container";
import { CardCommentCreateSchema, CardCommentUpdateSchema } from "~/server/zod";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const cardCommentRouter = createTRPCRouter({
  // Create a new card comment (requires card access)
  create: authedProcedure
    .input(CardCommentCreateSchema)
    .mutation(async ({ input }) => {
      // Access services via the services object
      await services.authService.canAccessCard(input.cardId);
      return services.cardCommentService.create(input);
    }),

  // List comments for a card (requires card access)
  list: authedProcedure.input(z.number()).query(async ({ input }) => {
    // Access services via the services object
    await services.authService.canAccessCard(input);
    return services.cardCommentService.list(input);
  }),

  // Remove a comment (requires access to the comment's card)
  remove: authedProcedure.input(z.string()).mutation(async ({ input }) => {
    // Access services via the services object
    const comment = await services.cardCommentService.get(input);

    // Verify user can access the card this comment belongs to
    await services.authService.canAccessCard(comment.cardId);
    return services.cardCommentService.remove(input);
  }),

  // Update a comment (requires access to the comment's card)
  update: authedProcedure
    .input(CardCommentUpdateSchema)
    .mutation(async ({ input }) => {
      // Access services via the services object
      const comment = await services.cardCommentService.get(
        input.cardCommentId,
      );

      // Verify user can access the card this comment belongs to
      await services.authService.canAccessCard(comment.cardId);
      return services.cardCommentService.update(
        input.cardCommentId,
        input.data,
      );
    }),
});
