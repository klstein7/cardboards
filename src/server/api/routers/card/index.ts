import { z } from "zod";

import { cardService } from "~/server/services";
import {
  CardCreateManySchema,
  CardCreateSchema,
  CardGenerateSchema,
  CardMoveSchema,
  CardUpdateSchema,
} from "~/server/zod";
import {
  authedProcedure,
  boardByIdProcedure,
  boardProcedure,
  cardByIdProcedure,
  cardProcedure,
  columnByIdProcedure,
  columnProcedure,
  createTRPCRouter,
  projectByIdProcedure,
} from "~/trpc/init";

export const cardRouter = createTRPCRouter({
  // Create a new card
  create: columnProcedure.input(CardCreateSchema).mutation(({ input }) => {
    return cardService.create(input);
  }),

  // Create multiple cards
  createMany: boardProcedure
    .input(z.object({ data: CardCreateManySchema.shape.data }))
    .mutation(({ ctx, input }) => {
      return cardService.createMany(ctx.boardId, input.data);
    }),

  // Get a specific card
  get: cardByIdProcedure.query(({ ctx }) => {
    return cardService.get(ctx.cardId);
  }),

  // Update a card
  update: cardProcedure
    .input(z.object({ data: CardUpdateSchema.shape.data }))
    .mutation(({ ctx, input }) => {
      return cardService.update(ctx.cardId, input.data);
    }),

  // Move a card
  move: cardProcedure
    .input(
      z.object({
        destinationColumnId: z.string(),
        sourceColumnId: z.string(),
        newOrder: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return cardService.move({
        cardId: ctx.cardId,
        destinationColumnId: input.destinationColumnId,
        sourceColumnId: input.sourceColumnId,
        newOrder: input.newOrder,
      });
    }),

  // Delete a card
  delete: cardByIdProcedure.mutation(({ ctx }) => {
    return cardService.del(ctx.cardId);
  }),

  // List cards in a column
  list: columnByIdProcedure.query(({ ctx }) => {
    return cardService.list(ctx.columnId);
  }),

  // Generate cards with AI
  generate: boardProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(({ ctx, input }) => {
      return cardService.generate(ctx.boardId, input.prompt);
    }),

  // Count cards by board ID
  countByBoardId: boardByIdProcedure.query(({ ctx }) => {
    return cardService.countByBoardId(ctx.boardId);
  }),

  // Count cards by project ID
  countByProjectId: projectByIdProcedure.query(({ ctx }) => {
    return cardService.countByProjectId(ctx.projectId);
  }),

  // Assign a card to the current user
  assignToCurrentUser: cardByIdProcedure.mutation(({ ctx }) => {
    return cardService.assignToCurrentUser(ctx.cardId);
  }),
});
