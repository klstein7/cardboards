import { z } from "zod";

import { columnService } from "~/server/services/column.service";
import {
  ColumnCreateSchema,
  ColumnShiftSchema,
  ColumnUpdateSchema,
} from "~/server/zod";
import {
  boardByIdProcedure,
  boardProcedure,
  columnByIdProcedure,
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
    .input(z.object({ data: ColumnUpdateSchema.shape.data }))
    .mutation(({ ctx, input }) => {
      return columnService.update(ctx.columnId, input.data);
    }),

  // Shift a column
  shift: columnProcedure
    .input(z.object({ data: ColumnShiftSchema.shape.data }))
    .mutation(({ ctx, input }) => {
      return columnService.shift(ctx.columnId, input.data);
    }),

  // Create a column
  create: boardProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        isCompleted: z.boolean().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return columnService.create({
        boardId: ctx.boardId,
        name: input.name,
        description: input.description,
        isCompleted: input.isCompleted,
      });
    }),
});
