import "server-only";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { and, desc, eq, type InferSelectModel } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import {
  aiInsights,
  type boards,
  type cards,
  type columns,
  type history,
} from "../db/schema";
import {
  type AiInsightCreate,
  AiInsightGenerateResponseSchema,
  type AiInsightUpdatePayload,
} from "../zod";
import { BaseService } from "./base.service";
import { type BoardService } from "./board.service";
import { type CardService } from "./card.service";
import { type ColumnService } from "./column.service";
import { type HistoryService } from "./history.service";
import { type ProjectService } from "./project.service";

// Define local types using InferSelectModel
type Board = InferSelectModel<typeof boards>;
type Card = InferSelectModel<typeof cards>;
type Column = InferSelectModel<typeof columns>;
type History = InferSelectModel<typeof history>;
// Define type for the column count structure
type BoardStats = { board: string; cardCount: number; columnCount: number };

/**
 * Service for managing AI insight-related operations
 */
export class AiInsightService extends BaseService {
  private readonly boardService: BoardService;
  private readonly cardService: CardService;
  private readonly columnService: ColumnService;
  private readonly historyService: HistoryService;
  private readonly projectService: ProjectService;

  constructor(
    db: Database,
    boardService: BoardService,
    cardService: CardService,
    columnService: ColumnService,
    historyService: HistoryService,
    projectService: ProjectService,
  ) {
    super(db);
    this.boardService = boardService;
    this.cardService = cardService;
    this.columnService = columnService;
    this.historyService = historyService;
    this.projectService = projectService;
  }

  /**
   * Create a new AI insight entry
   */
  async create(data: AiInsightCreate, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      let projectId = data.projectId;
      let boardId = data.boardId;

      if (data.entityType === "project" && !projectId) {
        projectId = data.entityId;
      } else if (data.entityType === "board" && !boardId) {
        boardId = data.entityId;

        if (!projectId && boardId) {
          const board = await this.boardService.get(boardId, txOrDb);
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
    }, tx ?? this.db);
  }

  /**
   * Get an AI insight by ID
   */
  async get(insightId: string, tx?: Transaction | Database) {
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
    }, tx ?? this.db);
  }

  /**
   * List insights for a specific entity
   */
  async listByEntity(
    entityType: AiInsightCreate["entityType"],
    entityId: string,
    tx?: Transaction | Database,
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
    }, tx ?? this.db);
  }

  /**
   * List active insights for a specific entity
   */
  async listActiveByEntity(
    entityType: AiInsightCreate["entityType"],
    entityId: string,
    tx?: Transaction | Database,
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
    }, tx ?? this.db);
  }

  /**
   * Update an AI insight
   */
  async update(
    insightId: string,
    data: AiInsightUpdatePayload,
    tx?: Transaction | Database,
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
    }, tx ?? this.db);
  }

  /**
   * Delete an AI insight
   */
  async del(insightId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const [insight] = await txOrDb
        .delete(aiInsights)
        .where(eq(aiInsights.id, insightId))
        .returning();

      if (!insight) {
        throw new Error("Failed to delete AI insight");
      }

      return insight;
    }, tx ?? this.db);
  }

  async generateBoardInsights(boardId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const board = await this.boardService.get(boardId, txOrDb);

      const previousInsights = await txOrDb.query.aiInsights.findMany({
        where: eq(aiInsights.boardId, boardId),
        orderBy: desc(aiInsights.createdAt),
        limit: 10,
      });

      await txOrDb
        .update(aiInsights)
        .set({ isActive: false })
        .where(eq(aiInsights.boardId, boardId));

      const columns = await this.columnService.list(boardId, txOrDb);

      const cardPromises = columns.map((column: Column) =>
        this.cardService.list(column.id, txOrDb),
      );
      const cards = (await Promise.all(cardPromises)).flat();

      const cardHistoryPromises = cards
        .slice(0, 10)
        .map((card: Card) =>
          this.historyService.listByEntity("card", card.id.toString(), txOrDb),
        );
      const cardHistories = await Promise.all(cardHistoryPromises);
      const flattenedCardHistory = cardHistories
        .flat()
        .sort(
          (a: History, b: History) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 50);

      const cardMoves = flattenedCardHistory.filter(
        (h: History) => h.action === "move",
      );
      const cardCreations = flattenedCardHistory.filter(
        (h: History) => h.action === "create",
      );
      const cardUpdates = flattenedCardHistory.filter(
        (h: History) => h.action === "update",
      );

      const { object } = await generateObject({
        model: google("gemini-2.0-flash-exp"),
        schema: AiInsightGenerateResponseSchema,
        prompt: `
You're analyzing a Kanban board: "${board.name}" with ${cards.length} tasks across ${columns.length} columns.

Key statistics:
- Column distribution: ${columns.map((col: Column) => `${col.name}: ${cards.filter((c: Card) => c.columnId === col.id).length}`).join(" | ")}
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
    }, tx ?? this.db);
  }

  async generateProjectInsights(
    projectId: string,
    tx?: Transaction | Database,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const previousInsights = await txOrDb.query.aiInsights.findMany({
        where: eq(aiInsights.projectId, projectId),
        orderBy: desc(aiInsights.createdAt),
        limit: 10,
      });

      await txOrDb
        .update(aiInsights)
        .set({ isActive: false })
        .where(eq(aiInsights.projectId, projectId));

      const project = await this.projectService.get(projectId, txOrDb);
      const boards = await this.boardService.list(projectId, txOrDb);

      const columnPromises = boards.flatMap((board: Board) =>
        this.columnService.list(board.id, txOrDb),
      );

      const columns = (await Promise.all(columnPromises)).flat();

      const cardPromises = columns.flatMap((col: Column) =>
        this.cardService.list(col.id, txOrDb),
      );
      const cards = (await Promise.all(cardPromises)).flat();

      const projectHistory = await this.historyService.listByProjectPaginated(
        projectId,
        50,
        0,
        txOrDb,
      );

      const cardMoves = projectHistory.items.filter(
        (h: History) => h.entityType === "card" && h.action === "move",
      );

      const completedColumns = columns.filter((col: Column) => col.isCompleted);
      const completedCards = completedColumns.reduce(
        (count: number, col: Column) =>
          count + cards.filter((c: Card) => c.columnId === col.id).length,
        0,
      );

      const completionRate =
        cards.length > 0
          ? `${Math.round((completedCards / cards.length) * 100)}%`
          : "No data";

      const columnCountByBoard: BoardStats[] = boards.map((board: Board) => ({
        board: board.name,
        columnCount: columns.filter((col: Column) => col.boardId === board.id)
          .length,
        cardCount: cards.filter(
          (card: Card) =>
            columns.find((col: Column) => col.id === card.columnId)?.boardId ===
            board.id,
        ).length,
      }));

      const { object } = await generateObject({
        model: google("gemini-2.0-flash-exp"),
        schema: AiInsightGenerateResponseSchema,
        prompt: `
You're analyzing project: "${project.name}" with ${boards.length} boards, ${columns.length} columns, and ${cards.length} tasks.

Key statistics:
- Boards: ${boards.map((b: Board) => b.name).join(", ")}
- Distribution: ${columnCountByBoard.map((b: BoardStats) => `${b.board}: ${b.cardCount}`).join(" | ")}
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
Only reference boards that exist in this project: ${boards.map((b: Board) => b.name).join(", ")}
`,
      });

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
    }, tx ?? this.db);
  }
}
