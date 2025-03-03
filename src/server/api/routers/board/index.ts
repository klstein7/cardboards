import { boardService } from "~/server/services";
import {
  BoardCreateSchema,
  BoardGenerateSchema,
  BoardUpdateSchema,
} from "~/server/zod";
import {
  authedProcedure,
  boardByIdProcedure,
  createTRPCRouter,
  projectByIdProcedure,
  projectMemberByIdProcedure,
} from "~/trpc/init";

export const boardRouter = createTRPCRouter({
  // Create a new board
  create: authedProcedure
    .input(BoardCreateSchema)
    .mutation(async ({ input }) => {
      return boardService.create(input);
    }),

  // List boards for a project
  list: projectMemberByIdProcedure.query(({ ctx }) => {
    return boardService.list(ctx.projectId);
  }),

  // Get a specific board
  get: boardByIdProcedure.query(({ ctx }) => {
    return boardService.get(ctx.boardId);
  }),

  // Update a board
  update: authedProcedure
    .input(BoardUpdateSchema)
    .mutation(async ({ input }) => {
      return boardService.update(input.boardId, input.data);
    }),

  // Delete a board
  delete: boardByIdProcedure.mutation(({ ctx }) => {
    return boardService.del(ctx.boardId);
  }),

  // Generate a board using AI
  generate: authedProcedure
    .input(BoardGenerateSchema)
    .mutation(async ({ input }) => {
      return boardService.generate(input.projectId, input.prompt);
    }),

  // Count boards by project ID
  countByProjectId: projectByIdProcedure.query(({ ctx }) => {
    return boardService.countByProjectId(ctx.projectId);
  }),
});
