import { z } from "zod";

import { pusherChannels } from "~/pusher/channels";
import { pusher } from "~/pusher/server";
import { authService, boardService } from "~/server/services";
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
      await authService.requireProjectAdmin(input.projectId);
      const board = await boardService.create(input);

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
    await authService.canAccessProject(input);
    return boardService.list(input);
  }),

  get: authedProcedure.input(z.string()).query(async ({ input }) => {
    await authService.canAccessBoard(input);
    return boardService.get(input);
  }),

  update: authedProcedure
    .input(BoardUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      await authService.requireBoardAdmin(input.boardId);
      const board = await boardService.update(input.boardId, input.data);

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
    await authService.requireBoardAdmin(input);
    const board = await boardService.del(input);

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
      await authService.requireProjectAdmin(input.projectId);
      return boardService.generate(input.projectId, input.prompt);
    }),

  countByProjectId: authedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      await authService.canAccessProject(input);
      return boardService.countByProjectId(input);
    }),
});
