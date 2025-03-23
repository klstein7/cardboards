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

      // Get board history data
      const boardHistory = await historyService.listByEntity(
        "board",
        boardId,
        txOrDb,
      );

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

      // Get 10 most recent events
      const recentEvents = [...boardHistory, ...flattenedCardHistory]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 10);

      // Format recent events for display
      const recentEventsText =
        recentEvents.length > 0
          ? `
RECENT EVENTS:
${recentEvents
  .map((event) => {
    const date = new Date(event.createdAt).toLocaleDateString();
    const entityType =
      event.entityType.charAt(0).toUpperCase() + event.entityType.slice(1);
    return `- ${date}: ${entityType} ${event.action} ${event.changes ? `(${event.changes.substring(0, 30)}${event.changes.length > 30 ? "..." : ""})` : ""}`;
  })
  .join("\n")}`
          : "";

      // Format card data for the prompt
      const cardDetailsText =
        cards.length > 0
          ? `
CARD DETAILS:
${cards
  .slice(0, 20)
  .map((card, index) => {
    const columnName =
      columns.find((col) => col.id === card.columnId)?.name ?? "Unknown Column";
    return `- Card ${index + 1}: "${card.title}" (in ${columnName})${card.description ? ` - ${card.description.substring(0, 50)}${card.description.length > 50 ? "..." : ""}` : ""}`;
  })
  .join(
    "\n",
  )}${cards.length > 20 ? `\n... and ${cards.length - 20} more cards` : ""}
`
          : "";

      // Create a historical summary
      const historyText = `
HISTORICAL DATA:
- Board changes: ${boardHistory.length} events
- Card movements: ${cardMoves.length} in recent history
- Cards created: ${cardCreations.length} in recent history
- Cards updated: ${cardUpdates.length} in recent history
${recentEventsText}
      `;

      // Add card stats to provide more context
      const cardsByColumn = columns.map((col) => ({
        column: col.name,
        count: cards.filter((c) => c.columnId === col.id).length,
      }));

      // Calculate basic metrics like cards per column and potential bottlenecks
      const avgCardsPerColumn = cards.length / columns.length;
      const potentialBottlenecks = cardsByColumn
        .filter((col) => col.count > avgCardsPerColumn * 1.5)
        .map((col) => col.column);

      const cardStatsText = `
CARD STATISTICS:
- Average cards per column: ${avgCardsPerColumn.toFixed(1)}
- Potential bottlenecks: ${potentialBottlenecks.length > 0 ? potentialBottlenecks.join(", ") : "None detected"}
      `;

      const { object } = await generateObject({
        model: google("gemini-2.0-flash-exp"),
        schema: AiInsightGenerateResponseSchema,
        prompt: `
You're a helpful teammate providing insights on this Kanban board:

### BOARD INFO: ${board.name}
• Columns: ${columns.length} (${columns.map((col) => col.name).join(", ")})
• Tasks: ${cards.length}
• Distribution: ${columns.map((col) => `${col.name}: ${cards.filter((c) => c.columnId === col.id).length}`).join(" | ")}

### CARD STATS
${cardStatsText.trim()}

### CARD DETAILS
${cardDetailsText.trim()}

### ACTIVITY
${historyText.trim()}

${
  previousInsights.length > 0
    ? `### PREVIOUS INSIGHTS (provide different insights this time)
${previousInsights.map((insight) => `• ${insight.title}: ${insight.content} (${insight.severity})`).join("\n")}`
    : ""
}

### YOUR TASK
Give 1-3 specific, actionable insights in a friendly, conversational tone. Talk like you're chatting with a teammate, not writing a report.

For each insight:
1. Give a practical, action-oriented title (3-5 words)
2. Provide specific advice with clear next steps (1-2 conversational sentences, max 30 words)
3. Assign a severity ("info", "warning", or "critical")
4. Choose a relevant type ("sprint_prediction", "bottleneck", "productivity", "risk_assessment", "recommendation")

Make each insight useful by answering:
• Who should do what?
• Why does it matter?
• How will we know if it's working?

Be specific about tasks, columns, and team members where possible. Use examples from the actual cards.
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

      // Get project history data (limited to 100 recent events)
      const projectHistory = await historyService.listByProjectPaginated(
        projectId,
        100,
        0,
        txOrDb,
      );

      // Analyze history entries
      const recentActions = projectHistory.items.slice(0, 20);
      const cardMoves = projectHistory.items.filter(
        (h) => h.entityType === "card" && h.action === "move",
      );
      const boardChanges = projectHistory.items.filter(
        (h) => h.entityType === "board",
      );

      // Format 10 most recent events for display
      const recentEventsText =
        projectHistory.items.length > 0
          ? `
RECENT EVENTS:
${projectHistory.items
  .slice(0, 10)
  .map((event) => {
    const date = new Date(event.createdAt).toLocaleDateString();
    const entityType =
      event.entityType.charAt(0).toUpperCase() + event.entityType.slice(1);
    return `- ${date}: ${entityType} ${event.action} ${event.changes ? `(${event.changes.substring(0, 30)}${event.changes.length > 30 ? "..." : ""})` : ""}`;
  })
  .join("\n")}`
          : "";

      // Format card data for the prompt
      const cardDetailsText =
        cards.length > 0
          ? `
CARD DETAILS:
${cards
  .slice(0, 25)
  .map((card, index) => {
    const columnName =
      columns.find((col) => col.id === card.columnId)?.name ?? "Unknown Column";
    const boardName =
      boards.find(
        (board) =>
          board.id === columns.find((col) => col.id === card.columnId)?.boardId,
      )?.name ?? "Unknown Board";
    return `- Card ${index + 1}: "${card.title}" (in ${columnName}, ${boardName})${card.description ? ` - ${card.description.substring(0, 50)}${card.description.length > 50 ? "..." : ""}` : ""}`;
  })
  .join(
    "\n",
  )}${cards.length > 25 ? `\n... and ${cards.length - 25} more cards` : ""}
`
          : "";

      // Create historical activity summary
      const historyText = `
HISTORICAL DATA:
- Total history entries: ${projectHistory.pagination.total} events
- Recent card movements: ${cardMoves.length} in latest history
- Board-related changes: ${boardChanges.length} in latest history
- Activity level: ${recentActions.length > 15 ? "High" : recentActions.length > 5 ? "Medium" : "Low"} (based on recent actions)
${recentEventsText}
      `;

      // Add board and card stats to provide more context
      const columnCountByBoard = boards.map((board) => ({
        board: board.name,
        columnCount: columns.filter((col) => col.boardId === board.id).length,
        cardCount: cards.filter(
          (card) =>
            columns.find((col) => col.id === card.columnId)?.boardId ===
            board.id,
        ).length,
      }));

      // Calculate the completion rate based on cards in "Done" or similar columns
      const doneColumnPatterns = ["Done", "Completed", "Finished"];
      const doneColumns = columns.filter((col) =>
        doneColumnPatterns.some((pattern) =>
          col.name.toLowerCase().includes(pattern.toLowerCase()),
        ),
      );

      const completedCards = doneColumns.reduce(
        (count, col) =>
          count + cards.filter((c) => c.columnId === col.id).length,
        0,
      );

      const completionRate =
        cards.length > 0
          ? `${Math.round((completedCards / cards.length) * 100)}%`
          : "No data";

      // Find potentially overloaded boards
      const avgCardsPerBoard = cards.length / boards.length;
      const overloadedBoards = columnCountByBoard
        .filter((b) => b.cardCount > avgCardsPerBoard * 1.5)
        .map((b) => b.board);

      const projectStatsText = `
PROJECT STATISTICS:
- Cards per board: ${columnCountByBoard.map((b) => `${b.board}: ${b.cardCount}`).join(", ")}
- Completion rate: ${completionRate}
- Potentially overloaded boards: ${overloadedBoards.length > 0 ? overloadedBoards.join(", ") : "None detected"}
      `;

      const { object } = await generateObject({
        model: google("gemini-2.0-flash-exp"),
        schema: AiInsightGenerateResponseSchema,
        prompt: `
You're a helpful teammate providing insights on this project:

### PROJECT INFO: ${project.name}
• Boards: ${boards.length} (${boards.map((b) => b.name).join(", ")})
• Columns: ${columns.length}
• Tasks: ${cards.length}
• Distribution across boards: ${columnCountByBoard.map((b) => `${b.board}: ${b.cardCount}`).join(" | ")}

### PROJECT STATS
${projectStatsText.trim()}

### CARD DETAILS
${cardDetailsText.trim()}

### ACTIVITY
${historyText.trim()}

${
  previousInsights.length > 0
    ? `### PREVIOUS INSIGHTS (provide different insights this time)
${previousInsights.map((insight) => `• ${insight.title}: ${insight.content} (${insight.severity})`).join("\n")}`
    : ""
}

### YOUR TASK
Give 1-3 specific, actionable insights in a friendly, conversational tone. Talk like you're chatting with a teammate, not writing a report.

For each insight:
1. Give a practical, action-oriented title (3-5 words)
2. Provide specific advice with clear next steps (1-2 conversational sentences, max 30 words)
3. Assign a severity ("info", "warning", or "critical") 
4. Choose a relevant type ("sprint_prediction", "bottleneck", "productivity", "risk_assessment", "recommendation")

Make each insight useful by answering:
• Who should do what?
• Why does it matter?
• How will we know if it's working?

Be specific about boards, tasks, and team members where possible. Use examples from the actual cards.
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
