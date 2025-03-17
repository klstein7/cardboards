import { z } from "zod";

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
    .mutation(async ({ input }) => {
      await authService.canAccessProject(input.projectId);
      return boardService.create(input);
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
    .mutation(async ({ input }) => {
      await authService.canAccessBoard(input.boardId);
      return boardService.update(input.boardId, input.data);
    }),

  delete: authedProcedure.input(z.string()).mutation(async ({ input }) => {
    await authService.canAccessBoard(input);
    return boardService.del(input);
  }),

  generate: authedProcedure
    .input(BoardGenerateSchema)
    .mutation(async ({ input }) => {
      await authService.canAccessProject(input.projectId);
      return boardService.generate(input.projectId, input.prompt);
    }),

  countByProjectId: authedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      await authService.canAccessProject(input);
      return boardService.countByProjectId(input);
    }),
});
