import { z } from "zod";

import { pusherChannels } from "~/pusher/channels";
import { pusher } from "~/pusher/server";
import { services } from "~/server/services/container";
import {
  BoardCreateSchema,
  BoardGenerateSchema,
  BoardUpdateSchema,
} from "~/server/zod";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const boardRouter = createTRPCRouter({
  create: authedProcedure
    .input(BoardCreateSchema)
    .mutation(async ({ input, ctx }) => {
      await services.authService.requireProjectAdmin(input.projectId);
      const board = await services.boardService.create(input);

      await pusher.trigger(
        pusherChannels.board.name,
        pusherChannels.board.events.created.name,
        {
          input: board,
          returning: board,
          userId: ctx.userId,
        },
      );

      return board;
    }),

  list: authedProcedure.input(z.string()).query(async ({ input }) => {
    await services.authService.canAccessProject(input);
    return services.boardService.list(input);
  }),

  get: authedProcedure.input(z.string()).query(async ({ input }) => {
    await services.authService.canAccessBoard(input);
    return services.boardService.get(input);
  }),

  update: authedProcedure
    .input(BoardUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      await services.authService.requireBoardAdmin(input.boardId);
      const board = await services.boardService.update(
        input.boardId,
        input.data,
      );

      await pusher.trigger(
        pusherChannels.board.name,
        pusherChannels.board.events.updated.name,
        {
          input,
          returning: board,
          userId: ctx.userId,
        },
      );

      return board;
    }),

  delete: authedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    await services.authService.requireBoardAdmin(input);
    const board = await services.boardService.del(input);

    await pusher.trigger(
      pusherChannels.board.name,
      pusherChannels.board.events.deleted.name,
      {
        input,
        returning: board,
        userId: ctx.userId,
      },
    );

    return board;
  }),

  generate: authedProcedure
    .input(BoardGenerateSchema)
    .mutation(async ({ input }) => {
      await services.authService.requireProjectAdmin(input.projectId);
      return services.boardService.generate(input.projectId, input.prompt);
    }),

  countByProjectId: authedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      await services.authService.canAccessProject(input);
      return services.boardService.countByProjectId(input);
    }),
});
