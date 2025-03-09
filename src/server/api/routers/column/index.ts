import { z } from "zod";

import { authService } from "~/server/services";
import { columnService } from "~/server/services/column.service";
import { ColumnShiftSchema, ColumnUpdateSchema } from "~/server/zod";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const columnRouter = createTRPCRouter({
  list: authedProcedure.input(z.string()).query(async ({ input }) => {
    await authService.canAccessBoard(input);
    return columnService.list(input);
  }),

  update: authedProcedure
    .input(ColumnUpdateSchema)
    .mutation(async ({ input }) => {
      await authService.canAccessColumn(input.columnId);
      return columnService.update(input.columnId, input.data);
    }),

  shift: authedProcedure
    .input(ColumnShiftSchema)
    .mutation(async ({ input }) => {
      await authService.canAccessColumn(input.columnId);
      return columnService.shift(input.columnId, input.data);
    }),

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
      await authService.canAccessBoard(input.boardId);
      return columnService.create(input);
    }),
});
