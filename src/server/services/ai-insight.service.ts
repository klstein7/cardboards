import "server-only";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { and, desc, eq } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { aiInsights } from "../db/schema";
import {
  type AiInsightCreate,
  AiInsightGenerateResponseSchema,
  type AiInsightUpdatePayload,
} from "../zod";
import { BaseService } from "./base.service";
import { boardService } from "./board.service";
import { cardService } from "./card.service";
import { columnService } from "./column.service";
import { projectService } from "./project.service";

/**
 * Service for managing AI insight-related operations
 */
class AiInsightService extends BaseService {
  /**
   * Create a new AI insight entry
   */
  async create(data: AiInsightCreate, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      // Determine projectId or boardId based on entityType
      let projectId = data.projectId;
      let boardId = data.boardId;

      if (data.entityType === "project" && !projectId) {
        projectId = data.entityId;
      } else if (data.entityType === "board" && !boardId) {
        boardId = data.entityId;

        // If no project ID is provided but we have a board ID, fetch the project ID
        if (!projectId && boardId) {
          const board = await boardService.get(boardId, txOrDb);
          projectId = board.projectId;
        }
      }

      const [insight] = await txOrDb
        .insert(aiInsights)
        .values({
          ...data,
          projectId,
          boardId,
        })
        .returning();

      if (!insight) {
        throw new Error("Failed to create AI insight entry");
      }

      return insight;
    }, tx);
  }

  /**
   * Get an AI insight by ID
   */
  async get(insightId: string, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const insight = await txOrDb.query.aiInsights.findFirst({
        where: eq(aiInsights.id, insightId),
        with: {
          project: true,
          board: true,
        },
      });

      if (!insight) {
        throw new Error("AI insight not found");
      }

      return insight;
    }, tx);
  }

  /**
   * List insights for a specific entity
   */
  async listByEntity(
    entityType: AiInsightCreate["entityType"],
    entityId: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      let insightQuery;

      if (entityType === "project") {
        insightQuery = txOrDb.query.aiInsights.findMany({
          where: eq(aiInsights.projectId, entityId),
          orderBy: desc(aiInsights.createdAt),
        });
      } else {
        insightQuery = txOrDb.query.aiInsights.findMany({
          where: eq(aiInsights.boardId, entityId),
          orderBy: desc(aiInsights.createdAt),
        });
      }

      return insightQuery;
    }, tx);
  }

  /**
   * List active insights for a specific entity
   */
  async listActiveByEntity(
    entityType: AiInsightCreate["entityType"],
    entityId: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      let whereClause;

      if (entityType === "project") {
        whereClause = and(
          eq(aiInsights.projectId, entityId),
          eq(aiInsights.isActive, true),
        );
      } else {
        whereClause = and(
          eq(aiInsights.boardId, entityId),
          eq(aiInsights.isActive, true),
        );
      }

      return txOrDb.query.aiInsights.findMany({
        where: whereClause,
        orderBy: desc(aiInsights.createdAt),
      });
    }, tx);
  }

  /**
   * Update an AI insight
   */
  async update(
    insightId: string,
    data: AiInsightUpdatePayload,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const [insight] = await txOrDb
        .update(aiInsights)
        .set(data)
        .where(eq(aiInsights.id, insightId))
        .returning();

      if (!insight) {
        throw new Error("Failed to update AI insight");
      }

      return insight;
    }, tx);
  }

  /**
   * Delete an AI insight
   */
  async del(insightId: string, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const [insight] = await txOrDb
        .delete(aiInsights)
        .where(eq(aiInsights.id, insightId))
        .returning();

      if (!insight) {
        throw new Error("Failed to delete AI insight");
      }

      return insight;
    }, tx);
  }

  async generateBoardInsights(
    boardId: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      // Get board details
      const board = await boardService.get(boardId, txOrDb);

      // Get all columns for this board
      const columns = await columnService.list(boardId, txOrDb);

      // Get all cards for each column
      const cardPromises = columns.map((column) =>
        cardService.list(column.id, txOrDb),
      );
      const cards = (await Promise.all(cardPromises)).flat();

      const { object } = await generateObject({
        model: google("gemini-2.0-flash-exp"),
        schema: AiInsightGenerateResponseSchema,
        prompt: `
        As a board analytics expert, analyze the following board data and generate valuable insights:
        BOARD: ${board.name}

        CURRENT BOARD STATE:
        - Total columns: ${columns.length}
        - Total cards/tasks: ${cards.length}
        - Cards distribution: ${columns.map((col) => `${col.name}: ${cards.filter((c) => c.columnId === col.id).length}`).join(", ")}

        Generate 3-5 actionable insights about:
        1. Potential bottlenecks or workflow impediments
        2. Task distribution patterns
        3. Resource allocation suggestions
        4. Risk identification for timeline or scope
        5. Process improvement opportunities

        For each insight, provide:
        - A clear, specific title
        - Detailed content explaining the insight
        - A severity level (must be one of: "info", "warning", or "critical")
        - The insight type (must be one of: "sprint_prediction", "bottleneck", "productivity", "risk_assessment", "recommendation")

        Ensure insights are specific, data-driven, and actionable.
`,
      });

      return object;
    }, tx);
  }

  async generateProjectInsights(
    projectId: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const project = await projectService.get(projectId, txOrDb);
      const boards = await boardService.list(projectId, txOrDb);

      const columnPromises = boards.flatMap((board) =>
        columnService.list(board.id, txOrDb),
      );

      const columns = (await Promise.all(columnPromises)).flat();

      const cardPromises = columns.flatMap((col) =>
        cardService.list(col.id, txOrDb),
      );
      const cards = (await Promise.all(cardPromises)).flat();

      const { object } = await generateObject({
        model: google("gemini-2.0-flash-exp"),
        schema: AiInsightGenerateResponseSchema,
        prompt: `
        As a project analytics expert, analyze the following project data and generate valuable insights:
        PROJECT: ${project.name}

        BOARDS (${boards.length}): ${boards.map((b) => b.name).join(", ")}

        CURRENT PROJECT STATE:
        - Total boards: ${boards.length}
        - Total columns across all boards: ${columns.length}
        - Total cards/tasks: ${cards.length}
        - Cards distribution: ${columns.map((col) => `${col.name}: ${cards.filter((c) => c.columnId === col.id).length}`).join(", ")}

        Generate 3-5 actionable insights about:
        1. Potential bottlenecks or workflow impediments
        2. Team productivity patterns or velocity trends
        3. Resource allocation suggestions
        4. Risk identification for timeline or scope
        5. Process improvement opportunities

        For each insight, provide:
        - A clear, specific title
        - Detailed content explaining the insight
        - A severity level (must be one of: "info", "warning", or "critical")
        - The insight type (must be one of: "sprint_prediction", "bottleneck", "productivity", "risk_assessment", "recommendation")

        Ensure insights are specific, data-driven, and actionable.
`,
      });

      return object;
    }, tx);
  }
}

// Export a singleton instance
export const aiInsightService = new AiInsightService();
