import { z } from "zod";

import { authService, cardService } from "~/server/services";
import {
  CardCreateManySchema,
  CardCreateSchema,
  CardMoveSchema,
  CardUpdateSchema,
} from "~/server/zod";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const cardRouter = createTRPCRouter({
  // Create a new card (requires column access)
  create: authedProcedure
    .input(CardCreateSchema)
    .mutation(async ({ input }) => {
      // Verify user can access this column
      await authService.canAccessColumn(input.columnId);
      return cardService.create(input);
    }),

  // Create multiple cards (requires board access)
  createMany: authedProcedure
    .input(CardCreateManySchema)
    .mutation(async ({ input }) => {
      // Verify user can access this board
      await authService.canAccessBoard(input.boardId);
      return cardService.createMany(input.boardId, input.data);
    }),

  // Get a specific card (requires card access)
  get: authedProcedure.input(z.number()).query(async ({ input }) => {
    // Verify user can access this card
    await authService.canAccessCard(input);
    return cardService.get(input);
  }),

  // Update a card (requires card access)
  update: authedProcedure
    .input(CardUpdateSchema)
    .mutation(async ({ input }) => {
      // Verify user can access this card
      await authService.canAccessCard(input.cardId);
      return cardService.update(input.cardId, input.data);
    }),

  // Move a card between columns (requires card access)
  move: authedProcedure.input(CardMoveSchema).mutation(async ({ input }) => {
    // Verify user can access this card
    await authService.canAccessCard(input.cardId);
    return cardService.move({
      cardId: input.cardId,
      destinationColumnId: input.destinationColumnId,
      sourceColumnId: input.sourceColumnId,
      newOrder: input.newOrder,
    });
  }),

  // Delete a card (requires card access)
  delete: authedProcedure
    .input(z.object({ cardId: z.number() }))
    .mutation(async ({ input }) => {
      // Verify user can access this card
      await authService.canAccessCard(input.cardId);
      return cardService.del(input.cardId);
    }),

  // Duplicate a card (requires card access)
  duplicate: authedProcedure
    .input(z.object({ cardId: z.number() }))
    .mutation(async ({ input }) => {
      // Verify user can access this card
      await authService.canAccessCard(input.cardId);
      return cardService.duplicate(input.cardId);
    }),

  // List cards in a column (requires column access)
  list: authedProcedure.input(z.string()).query(async ({ input }) => {
    // Verify user can access this column
    await authService.canAccessColumn(input);
    return cardService.list(input);
  }),

  // Generate cards with AI (requires board access)
  generate: authedProcedure
    .input(
      z.object({
        boardId: z.string(),
        prompt: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      // Verify user can access this board
      await authService.canAccessBoard(input.boardId);
      return cardService.generate(input.boardId, input.prompt);
    }),

  // Count cards by board ID (requires board access)
  countByBoardId: authedProcedure.input(z.string()).query(async ({ input }) => {
    // Verify user can access this board
    await authService.canAccessBoard(input);
    return cardService.countByBoardId(input);
  }),

  // Count cards by project ID (requires project access)
  countByProjectId: authedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      // Verify user can access this project
      await authService.canAccessProject(input);
      return cardService.countByProjectId(input);
    }),

  // Assign a card to the current user (requires card access)
  assignToCurrentUser: authedProcedure
    .input(z.object({ cardId: z.number() }))
    .mutation(async ({ input }) => {
      // Verify user can access this card
      await authService.canAccessCard(input.cardId);
      return cardService.assignToCurrentUser(input.cardId);
    }),
});
