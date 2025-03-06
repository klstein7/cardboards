import { z } from "zod";

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
      return historyService.listByEntity(input.entityType, input.entityId);
    }),

  /**
   * Get history entries for a project
   */
  getByProject: authedProcedure
    .input(HistoryListByProjectSchema)
    .query(async ({ input }: { input: HistoryListByProject }) => {
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
        return historyService.listByProjectPaginated(
          input.projectId,
          input.limit,
          input.offset,
        );
      },
    ),
});
