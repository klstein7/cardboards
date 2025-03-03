import { columnService } from "~/server/services/column.service";
import {
  ColumnCreateSchema,
  ColumnShiftSchema,
  ColumnUpdateSchema,
} from "~/server/zod";
import {
  boardByIdProcedure,
  boardProcedure,
  columnProcedure,
  createTRPCRouter,
} from "~/trpc/init";

export const columnRouter = createTRPCRouter({
  // List columns in a board
  list: boardByIdProcedure.query(({ ctx }) => {
    return columnService.list(ctx.boardId);
  }),

  // Update a column
  update: columnProcedure
    .input(ColumnUpdateSchema)
    .mutation(({ ctx, input }) => {
      return columnService.update(ctx.columnId, input.data);
    }),

  // Shift a column
  shift: columnProcedure.input(ColumnShiftSchema).mutation(({ ctx, input }) => {
    return columnService.shift(ctx.columnId, input.data);
  }),

  // Create a column
  create: boardProcedure
    .input(ColumnCreateSchema)
    .mutation(({ ctx, input }) => {
      return columnService.create({
        boardId: ctx.boardId,
        name: input.name,
        description: input.description,
        isCompleted: input.isCompleted,
      });
    }),
});
