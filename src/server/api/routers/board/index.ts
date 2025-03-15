import { z } from "zod";

import {
  authService,
  boardService,
  projectUserService,
} from "~/server/services";
import {
  BoardCreateSchema,
  BoardGenerateSchema,
  BoardUpdateSchema,
} from "~/server/zod";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const boardRouter = createTRPCRouter({
  // Create a new board
  create: authedProcedure
    .input(BoardCreateSchema)
    .mutation(async ({ input }) => {
      // Verify user can access this project
      await authService.canAccessProject(input.projectId);
      return boardService.create(input);
    }),

  // List boards for a project (requires membership)
  list: authedProcedure.input(z.string()).query(async ({ input }) => {
    // Verify user can access this project
    await authService.canAccessProject(input);
    return boardService.list(input);
  }),

  // Get a specific board (requires board access)
  get: authedProcedure.input(z.string()).query(async ({ input }) => {
    // Verify user can access this board
    await authService.canAccessBoard(input);
    return boardService.get(input);
  }),

  // Update a board (requires board access)
  update: authedProcedure
    .input(BoardUpdateSchema)
    .mutation(async ({ input }) => {
      // Verify user can access this board
      await authService.canAccessBoard(input.boardId);
      return boardService.update(input.boardId, input.data);
    }),

  // Delete a board (requires board access)
  delete: authedProcedure.input(z.string()).mutation(async ({ input }) => {
    // Verify user can access this board
    await authService.canAccessBoard(input);
    return boardService.del(input);
  }),

  // Generate a board using AI (requires project access)
  generate: authedProcedure
    .input(BoardGenerateSchema)
    .mutation(async ({ input }) => {
      // Verify user can access this project
      await authService.canAccessProject(input.projectId);
      return boardService.generate(input.projectId, input.prompt);
    }),

  // Count boards by project ID (requires project access)
  countByProjectId: authedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      // Verify user can access this project
      await authService.canAccessProject(input);
      return boardService.countByProjectId(input);
    }),
});
