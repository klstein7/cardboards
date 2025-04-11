import { z } from "zod";

// Import the services object
import { services } from "~/server/services/container";
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
      // Access services via the services object
      if (input.entityType === "project") {
        await services.authService.canAccessProject(input.entityId);
      } else if (input.entityType === "board") {
        await services.authService.canAccessBoard(input.entityId);
      } else if (input.entityType === "column") {
        await services.authService.canAccessColumn(input.entityId);
      } else if (input.entityType === "card") {
        await services.authService.canAccessCard(Number(input.entityId));
      }

      return services.historyService.listByEntity(
        input.entityType,
        input.entityId,
      );
    }),

  /**
   * Get history entries for a project
   */
  getByProject: authedProcedure
    .input(HistoryListByProjectSchema)
    .query(async ({ input }: { input: HistoryListByProject }) => {
      // Access services via the services object
      await services.authService.canAccessProject(input.projectId);

      return services.historyService.listByProject(input.projectId);
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
        // Access services via the services object
        await services.authService.canAccessProject(input.projectId);

        return services.historyService.listByProjectPaginated(
          input.projectId,
          input.limit,
          input.offset,
        );
      },
    ),
});
