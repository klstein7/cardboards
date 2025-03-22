import { z } from "zod";

import { pusherChannels } from "~/pusher/channels";
import { pusher } from "~/pusher/server";
import { authService, cardService } from "~/server/services";
import {
  CardCreateManySchema,
  CardCreateSchema,
  CardMoveSchema,
  CardUpdateSchema,
} from "~/server/zod";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const cardRouter = createTRPCRouter({
  create: authedProcedure
    .input(CardCreateSchema)
    .mutation(async ({ input, ctx }) => {
      await authService.canAccessColumn(input.columnId);
      const card = await cardService.create(input);

      await pusher.trigger(
        pusherChannels.card.name,
        pusherChannels.card.events.created.name,
        {
          input: card,
          returning: card,
          userId: ctx.userId,
        },
      );

      return card;
    }),

  createMany: authedProcedure
    .input(CardCreateManySchema)
    .mutation(async ({ input }) => {
      await authService.canAccessBoard(input.boardId);
      return cardService.createMany(input.boardId, input.data);
    }),

  get: authedProcedure.input(z.number()).query(async ({ input }) => {
    await authService.canAccessCard(input);
    return cardService.get(input);
  }),

  update: authedProcedure
    .input(CardUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      await authService.canAccessCard(input.cardId);
      const card = await cardService.update(input.cardId, input.data);

      await pusher.trigger(
        pusherChannels.card.name,
        pusherChannels.card.events.updated.name,
        {
          input: card,
          returning: card,
          userId: ctx.userId,
        },
      );

      return card;
    }),

  move: authedProcedure
    .input(CardMoveSchema)
    .mutation(async ({ input, ctx }) => {
      await authService.canAccessCard(input.cardId);
      const card = await cardService.move({
        cardId: input.cardId,
        destinationColumnId: input.destinationColumnId,
        sourceColumnId: input.sourceColumnId,
        newOrder: input.newOrder,
      });

      await pusher.trigger(
        pusherChannels.card.name,
        pusherChannels.card.events.moved.name,
        {
          input,
          returning: card,
          userId: ctx.userId,
        },
      );

      return card;
    }),

  delete: authedProcedure
    .input(z.object({ cardId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await authService.canAccessCard(input.cardId);
      const card = await cardService.del(input.cardId);

      await pusher.trigger(
        pusherChannels.card.name,
        pusherChannels.card.events.deleted.name,
        {
          input: card,
          returning: card,
          userId: ctx.userId,
        },
      );

      return card;
    }),

  duplicate: authedProcedure
    .input(z.object({ cardId: z.number() }))
    .mutation(async ({ input }) => {
      await authService.canAccessCard(input.cardId);
      return cardService.duplicate(input.cardId);
    }),

  list: authedProcedure.input(z.string()).query(async ({ input }) => {
    await authService.canAccessColumn(input);
    return cardService.list(input);
  }),

  generate: authedProcedure
    .input(
      z.object({
        boardId: z.string(),
        prompt: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await authService.canAccessBoard(input.boardId);
      return cardService.generate(input.boardId, input.prompt);
    }),

  countByBoardId: authedProcedure.input(z.string()).query(async ({ input }) => {
    await authService.canAccessBoard(input);
    return cardService.countByBoardId(input);
  }),

  countByProjectId: authedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      await authService.canAccessProject(input);
      return cardService.countByProjectId(input);
    }),

  assignToCurrentUser: authedProcedure
    .input(z.object({ cardId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await authService.canAccessCard(input.cardId);
      const card = await cardService.assignToCurrentUser(input.cardId);

      await pusher.trigger(
        pusherChannels.card.name,
        pusherChannels.card.events.assignedToCurrentUser.name,
        { input, returning: card, userId: ctx.userId },
      );

      return card;
    }),
});
