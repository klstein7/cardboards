import { z } from "zod";

import { authService } from "~/server/services";
import { columnService } from "~/server/services/column.service";
import {
  ColumnCreateSchema,
  ColumnShiftSchema,
  ColumnUpdateSchema,
} from "~/server/zod";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const columnRouter = createTRPCRouter({
  // List columns in a board (requires board access)
  list: authedProcedure.input(z.string()).query(async ({ input }) => {
    // Verify user can access this board
    await authService.canAccessBoard(input);
    return columnService.list(input);
  }),

  // Update a column (requires column access)
  update: authedProcedure
    .input(ColumnUpdateSchema)
    .mutation(async ({ input }) => {
      // Verify user can access this column
      await authService.canAccessColumn(input.columnId);
      return columnService.update(input.columnId, input.data);
    }),

  // Shift a column's position (requires column access)
  shift: authedProcedure
    .input(ColumnShiftSchema)
    .mutation(async ({ input }) => {
      // Verify user can access this column
      await authService.canAccessColumn(input.columnId);
      return columnService.shift(input.columnId, input.data);
    }),

  // Create a new column (requires board access)
  create: authedProcedure
    .input(
      z.object({
        boardId: z.string(),
        name: z.string(),
        description: z.string().optional(),
        isCompleted: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Verify user can access this board
      await authService.canAccessBoard(input.boardId);
      return columnService.create(input);
    }),
});
