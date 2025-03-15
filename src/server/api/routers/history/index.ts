import { z } from "zod";

import { authService } from "~/server/services/auth.service";
import { historyService } from "~/server/services/history.service";
import {
  type HistoryListByEntity,
  HistoryListByEntitySchema,
  type HistoryListByProject,
  HistoryListByProjectSchema,
} from "~/server/zod";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const historyRouter = createTRPCRouter({
  /**
   * Get history entries for a specific entity
   */
  getByEntity: authedProcedure
    .input(HistoryListByEntitySchema)
    .query(async ({ input }: { input: HistoryListByEntity }) => {
      // Check access based on entity type
      if (input.entityType === "project") {
        await authService.canAccessProject(input.entityId);
      } else if (input.entityType === "board") {
        await authService.canAccessBoard(input.entityId);
      } else if (input.entityType === "column") {
        await authService.canAccessColumn(input.entityId);
      } else if (input.entityType === "card") {
        await authService.canAccessCard(Number(input.entityId));
      }

      return historyService.listByEntity(input.entityType, input.entityId);
    }),

  /**
   * Get history entries for a project
   */
  getByProject: authedProcedure
    .input(HistoryListByProjectSchema)
    .query(async ({ input }: { input: HistoryListByProject }) => {
      // Verify user can access this project
      await authService.canAccessProject(input.projectId);

      return historyService.listByProject(input.projectId);
    }),

  /**
   * Get paginated history entries for a project
   */
  getByProjectPaginated: authedProcedure
    .input(
      z.object({
        projectId: z.string(),
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(
      async ({
        input,
      }: {
        input: { projectId: string; limit: number; offset: number };
      }) => {
        // Verify user can access this project
        await authService.canAccessProject(input.projectId);

        return historyService.listByProjectPaginated(
          input.projectId,
          input.limit,
          input.offset,
        );
      },
    ),
});
