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
import { historyService } from "./history.service";
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

      // Get last 10 insights for this board to avoid repetition
      const previousInsights = await txOrDb.query.aiInsights.findMany({
        where: eq(aiInsights.boardId, boardId),
        orderBy: desc(aiInsights.createdAt),
        limit: 10,
      });

      // Set all existing insights for this board to inactive
      await txOrDb
        .update(aiInsights)
        .set({ isActive: false })
        .where(eq(aiInsights.boardId, boardId));

      // Get all columns for this board
      const columns = await columnService.list(boardId, txOrDb);

      // Get all cards for each column
      const cardPromises = columns.map((column) =>
        cardService.list(column.id, txOrDb),
      );
      const cards = (await Promise.all(cardPromises)).flat();

      // Get card history data (limited to last 50 entries for performance)
      const cardHistoryPromises = cards
        .slice(0, 10)
        .map((card) =>
          historyService.listByEntity("card", card.id.toString(), txOrDb),
        );
      const cardHistories = await Promise.all(cardHistoryPromises);
      const flattenedCardHistory = cardHistories
        .flat()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 50);

      // Analyze card movements from history
      const cardMoves = flattenedCardHistory.filter((h) => h.action === "move");
      const cardCreations = flattenedCardHistory.filter(
        (h) => h.action === "create",
      );
      const cardUpdates = flattenedCardHistory.filter(
        (h) => h.action === "update",
      );

      const { object } = await generateObject({
        model: google("gemini-2.0-flash-exp"),
        schema: AiInsightGenerateResponseSchema,
        prompt: `
You're analyzing a Kanban board: "${board.name}" with ${cards.length} tasks across ${columns.length} columns.

Key statistics:
- Column distribution: ${columns.map((col) => `${col.name}: ${cards.filter((c) => c.columnId === col.id).length}`).join(" | ")}
- Recent activity: ${cardMoves.length} card moves, ${cardCreations.length} new cards, ${cardUpdates.length} updates

${
  previousInsights.length > 0
    ? `Previous insights (provide different ones this time): ${previousInsights
        .slice(0, 3)
        .map((i) => i.title)
        .join(", ")}`
    : ""
}

Generate 1-3 actionable insights for this board. For each:
1. Title (3-5 words)
2. Content (1-2 sentences, max 30 words)
3. Severity ("info", "warning", "critical")
4. Type ("sprint_prediction", "bottleneck", "productivity", "risk_assessment", "recommendation")

Be practical, specific, and conversational - like talking to a teammate.
`,
      });

      // Persist generated insights to database
      const createdInsights = [];
      for (const insight of object.insights) {
        const insightData: AiInsightCreate = {
          entityType: "board",
          entityId: boardId,
          boardId,
          projectId: board.projectId,
          insightType: insight.insightType,
          title: insight.title,
          content: insight.content,
          severity: insight.severity,
          isActive: true,
          metadata: JSON.stringify({ generatedAt: new Date().toISOString() }),
        };

        const createdInsight = await this.create(insightData, txOrDb);
        createdInsights.push(createdInsight);
      }

      return createdInsights;
    }, tx);
  }

  async generateProjectInsights(
    projectId: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      // Get last 10 insights for this project to avoid repetition
      const previousInsights = await txOrDb.query.aiInsights.findMany({
        where: eq(aiInsights.projectId, projectId),
        orderBy: desc(aiInsights.createdAt),
        limit: 10,
      });

      // Set all existing insights for this project to inactive
      await txOrDb
        .update(aiInsights)
        .set({ isActive: false })
        .where(eq(aiInsights.projectId, projectId));

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

      // Get project history data (limited to recent events)
      const projectHistory = await historyService.listByProjectPaginated(
        projectId,
        50,
        0,
        txOrDb,
      );

      // Analyze history entries
      const cardMoves = projectHistory.items.filter(
        (h) => h.entityType === "card" && h.action === "move",
      );

      // Calculate the completion rate based on cards in columns marked as completed
      const completedColumns = columns.filter((col) => col.isCompleted);
      const completedCards = completedColumns.reduce(
        (count, col) =>
          count + cards.filter((c) => c.columnId === col.id).length,
        0,
      );

      const completionRate =
        cards.length > 0
          ? `${Math.round((completedCards / cards.length) * 100)}%`
          : "No data";

      // Add board and card stats
      const columnCountByBoard = boards.map((board) => ({
        board: board.name,
        columnCount: columns.filter((col) => col.boardId === board.id).length,
        cardCount: cards.filter(
          (card) =>
            columns.find((col) => col.id === card.columnId)?.boardId ===
            board.id,
        ).length,
      }));

      const { object } = await generateObject({
        model: google("gemini-2.0-flash-exp"),
        schema: AiInsightGenerateResponseSchema,
        prompt: `
You're analyzing project: "${project.name}" with ${boards.length} boards, ${columns.length} columns, and ${cards.length} tasks.

Key statistics:
- Boards: ${boards.map((b) => b.name).join(", ")}
- Distribution: ${columnCountByBoard.map((b) => `${b.board}: ${b.cardCount}`).join(" | ")}
- Completion rate: ${completionRate}
- Recent activity: ${cardMoves.length} card moves in recent history

${
  previousInsights.length > 0
    ? `Previous insights (provide different ones this time): ${previousInsights
        .slice(0, 3)
        .map((i) => i.title)
        .join(", ")}`
    : ""
}

Generate 1-3 actionable insights for this project. For each:
1. Title (3-5 words)
2. Content (1-2 sentences, max 30 words)
3. Severity ("info", "warning", "critical")
4. Type ("sprint_prediction", "bottleneck", "productivity", "risk_assessment", "recommendation")

Be practical, specific, and conversational - like talking to a teammate.
Only reference boards that exist in this project: ${boards.map((b) => b.name).join(", ")}
`,
      });

      // Persist generated insights to database
      const createdInsights = [];
      for (const insight of object.insights) {
        const insightData: AiInsightCreate = {
          entityType: "project",
          entityId: projectId,
          projectId,
          insightType: insight.insightType,
          title: insight.title,
          content: insight.content,
          severity: insight.severity,
          isActive: true,
          metadata: JSON.stringify({ generatedAt: new Date().toISOString() }),
        };

        const createdInsight = await this.create(insightData, txOrDb);
        createdInsights.push(createdInsight);
      }

      return createdInsights;
    }, tx);
  }
}

// Export a singleton instance
export const aiInsightService = new AiInsightService();
