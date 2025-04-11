import { z } from "zod";

import { pusherChannels } from "~/pusher/channels";
import { pusher } from "~/pusher/server";
import { services } from "~/server/services/container";
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
      await services.authService.canAccessColumn(input.columnId);
      const card = await services.cardService.create(input);

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
      await services.authService.canAccessBoard(input.boardId);
      return services.cardService.createMany(input.boardId, input.data);
    }),

  get: authedProcedure.input(z.number()).query(async ({ input }) => {
    await services.authService.canAccessCard(input);
    return services.cardService.get(input);
  }),

  update: authedProcedure
    .input(CardUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      await services.authService.canAccessCard(input.cardId);
      const card = await services.cardService.update(input.cardId, input.data);

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
      await services.authService.canAccessCard(input.cardId);
      const card = await services.cardService.move({
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
      await services.authService.canAccessCard(input.cardId);
      const card = await services.cardService.del(input.cardId);

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
      await services.authService.canAccessCard(input.cardId);
      return services.cardService.duplicate(input.cardId);
    }),

  list: authedProcedure.input(z.string()).query(async ({ input }) => {
    await services.authService.canAccessColumn(input);
    return services.cardService.list(input);
  }),

  generate: authedProcedure
    .input(
      z.object({
        boardId: z.string(),
        prompt: z.string(),
        focusType: z.enum(["planning", "task", "review"]).optional(),
        detailLevel: z
          .enum(["High-Level", "Standard", "Detailed"])
          .optional()
          .default("Standard"),
      }),
    )
    .mutation(async ({ input }) => {
      await services.authService.canAccessBoard(input.boardId);
      return services.cardService.generate(
        input.boardId,
        input.prompt,
        input.focusType,
        input.detailLevel,
      );
    }),

  generateSingle: authedProcedure
    .input(
      z.object({
        boardId: z.string(),
        prompt: z.string(),
        focusType: z.enum(["planning", "task", "review"]).optional(),
        detailLevel: z
          .enum(["High-Level", "Standard", "Detailed"])
          .optional()
          .default("Standard"),
      }),
    )
    .mutation(async ({ input }) => {
      await services.authService.canAccessBoard(input.boardId);
      return services.cardService.generateSingle(
        input.boardId,
        input.prompt,
        input.focusType,
        input.detailLevel,
      );
    }),

  countByBoardId: authedProcedure.input(z.string()).query(async ({ input }) => {
    await services.authService.canAccessBoard(input);
    return services.cardService.countByBoardId(input);
  }),

  countCompletedByBoardId: authedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      await services.authService.canAccessBoard(input);
      return services.cardService.countCompletedByBoardId(input);
    }),

  countByProjectId: authedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      await services.authService.canAccessProject(input);
      return services.cardService.countByProjectId(input);
    }),

  assignToCurrentUser: authedProcedure
    .input(z.object({ cardId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await services.authService.canAccessCard(input.cardId);
      const card = await services.cardService.assignToCurrentUser(input.cardId);

      await pusher.trigger(
        pusherChannels.card.name,
        pusherChannels.card.events.assignedToCurrentUser.name,
        { input, returning: card, userId: ctx.userId },
      );

      return card;
    }),
});
