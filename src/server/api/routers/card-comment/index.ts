import { cardCommentService } from "~/server/services";
import { CardCommentCreateSchema, CardCommentUpdateSchema } from "~/server/zod";
import {
  authedProcedure,
  cardByIdProcedure,
  cardCommentByIdProcedure,
  cardCommentCreateProcedure,
  createTRPCRouter,
} from "~/trpc/init";

export const cardCommentRouter = createTRPCRouter({
  // Create a new card comment
  create: cardCommentCreateProcedure
    .input(CardCommentCreateSchema)
    .mutation(({ input }) => {
      return cardCommentService.create(input);
    }),

  // List comments for a card
  list: cardByIdProcedure.query(({ ctx }) => {
    return cardCommentService.list(ctx.cardId);
  }),

  // Remove a comment
  remove: cardCommentByIdProcedure.mutation(({ ctx }) => {
    return cardCommentService.remove(ctx.cardCommentId);
  }),

  // Update a comment
  update: authedProcedure
    .input(CardCommentUpdateSchema)
    .mutation(async ({ input }) => {
      return cardCommentService.update(input.cardCommentId, input.data);
    }),
});
