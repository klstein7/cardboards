import { z } from "zod";

import { pusherChannels } from "~/pusher/channels";
import { pusher } from "~/pusher/server";
import { services } from "~/server/services/container";
import { ColumnShiftSchema, ColumnUpdateSchema } from "~/server/zod";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const columnRouter = createTRPCRouter({
  // List columns for a board (requires board access)
  list: authedProcedure.input(z.string()).query(async ({ input }) => {
    await services.authService.canAccessBoard(input);
    return services.columnService.list(input);
  }),

  // Update a column (requires admin access)
  update: authedProcedure
    .input(ColumnUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      await services.authService.requireColumnAdmin(input.columnId);
      const column = await services.columnService.update(
        input.columnId,
        input.data,
      );

      await pusher.trigger(
        pusherChannels.column.name,
        pusherChannels.column.events.updated.name,
        {
          input,
          returning: column,
          userId: ctx.userId,
        },
      );

      return column;
    }),

  // Shift a column's position (requires admin access)
  shift: authedProcedure
    .input(ColumnShiftSchema)
    .mutation(async ({ input, ctx }) => {
      await services.authService.requireColumnAdmin(input.columnId);
      const column = await services.columnService.shift(
        input.columnId,
        input.data,
      );

      await pusher.trigger(
        pusherChannels.column.name,
        pusherChannels.column.events.updated.name,
        {
          input,
          returning: column,
          userId: ctx.userId,
        },
      );

      return column;
    }),

  // Create a new column (requires admin access)
  create: authedProcedure
    .input(
      z.object({
        boardId: z.string(),
        name: z.string(),
        description: z.string().optional(),
        isCompleted: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await services.authService.requireBoardAdmin(input.boardId);
      const column = await services.columnService.create(input);

      await pusher.trigger(
        pusherChannels.column.name,
        pusherChannels.column.events.created.name,
        {
          input,
          returning: column,
          userId: ctx.userId,
        },
      );

      return column;
    }),

  // Delete a column (requires admin access)
  delete: authedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    await services.authService.requireColumnAdmin(input);
    const column = await services.columnService.del(input);

    await pusher.trigger(
      pusherChannels.column.name,
      pusherChannels.column.events.deleted.name,
      {
        input,
        returning: column,
        userId: ctx.userId,
      },
    );

    return column;
  }),
});
