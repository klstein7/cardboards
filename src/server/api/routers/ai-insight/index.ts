import { z } from "zod";

import { aiInsightService, authService } from "~/server/services";
import {
  AiInsightCreateSchema,
  AiInsightListByEntitySchema,
  AiInsightUpdateSchema,
} from "~/server/zod";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const aiInsightRouter = createTRPCRouter({
  create: authedProcedure
    .input(AiInsightCreateSchema)
    .mutation(async ({ input }) => {
      // If entity is a project, verify user has access to the project
      if (input.entityType === "project") {
        await authService.canAccessProject(input.entityId);
      }
      // If entity is a board, verify user has access to the board
      else if (input.entityType === "board") {
        await authService.canAccessBoard(input.entityId);
      }

      return aiInsightService.create(input);
    }),

  get: authedProcedure.input(z.string()).query(async ({ input }) => {
    const insight = await aiInsightService.get(input);

    // Check if user has access to the related project or board
    if (insight.projectId) {
      await authService.canAccessProject(insight.projectId);
    } else if (insight.boardId) {
      await authService.canAccessBoard(insight.boardId);
    }

    return insight;
  }),

  listByEntity: authedProcedure
    .input(AiInsightListByEntitySchema)
    .query(async ({ input }) => {
      // Verify user has access to the entity
      if (input.entityType === "project") {
        await authService.canAccessProject(input.entityId);
      } else if (input.entityType === "board") {
        await authService.canAccessBoard(input.entityId);
      }

      return aiInsightService.listByEntity(input.entityType, input.entityId);
    }),

  listActiveByEntity: authedProcedure
    .input(AiInsightListByEntitySchema)
    .query(async ({ input }) => {
      // Verify user has access to the entity
      if (input.entityType === "project") {
        await authService.canAccessProject(input.entityId);
      } else if (input.entityType === "board") {
        await authService.canAccessBoard(input.entityId);
      }

      return aiInsightService.listActiveByEntity(
        input.entityType,
        input.entityId,
      );
    }),

  update: authedProcedure
    .input(AiInsightUpdateSchema)
    .mutation(async ({ input }) => {
      // Get the insight to check permissions
      const insight = await aiInsightService.get(input.id);

      // Verify user has access to the project
      if (insight.projectId) {
        await authService.requireProjectAdmin(insight.projectId);
      }

      return aiInsightService.update(input.id, input.data);
    }),

  delete: authedProcedure.input(z.string()).mutation(async ({ input }) => {
    // Get the insight to check permissions
    const insight = await aiInsightService.get(input);

    // Verify user has admin permissions for the project
    if (insight.projectId) {
      await authService.requireProjectAdmin(insight.projectId);
    }

    return aiInsightService.del(input);
  }),

  generateBoardInsights: authedProcedure
    .input(z.string())
    .mutation(async ({ input: boardId }) => {
      // Verify user has access to the board
      await authService.canAccessBoard(boardId);

      return aiInsightService.generateBoardInsights(boardId);
    }),

  generateProjectInsights: authedProcedure
    .input(z.string())
    .mutation(async ({ input: projectId }) => {
      // Verify user has access to the project
      await authService.canAccessProject(projectId);

      return aiInsightService.generateProjectInsights(projectId);
    }),
});
