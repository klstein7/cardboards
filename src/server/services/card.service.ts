import "server-only";

import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  isNotNull,
  lt,
  lte,
  sql,
} from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { boards, cards, columns, projectUsers, users } from "../db/schema";
import {
  type CardCreate,
  type CardCreateManyPayload,
  CardGenerateResponseSchema,
  CardGenerateSingleResponseSchema,
  type CardMove,
  type CardUpdatePayload,
} from "../zod";
import { BaseService } from "./base.service";
import { type BoardContextService } from "./board-context.service";
import { type ColumnService } from "./column.service";
import { type HistoryService } from "./history.service";
import { type NotificationService } from "./notification.service";
import { type ProjectService } from "./project.service";
import { type ProjectUserService } from "./project-user.service";

// Type for labels in card create/update
interface Label {
  id: string;
  text: string;
}

/**
 * Service for managing card-related operations
 */
export class CardService extends BaseService {
  private readonly boardContextService: BoardContextService;
  private readonly columnService: ColumnService;
  private readonly historyService: HistoryService;
  private readonly notificationService: NotificationService;
  private readonly projectService: ProjectService;
  private readonly projectUserService: ProjectUserService;

  constructor(
    db: Database,
    boardContextService: BoardContextService,
    columnService: ColumnService,
    historyService: HistoryService,
    notificationService: NotificationService,
    projectService: ProjectService,
    projectUserService: ProjectUserService,
  ) {
    super(db);
    this.boardContextService = boardContextService;
    this.columnService = columnService;
    this.historyService = historyService;
    this.notificationService = notificationService;
    this.projectService = projectService;
    this.projectUserService = projectUserService;
  }

  /**
   * Get the order value for the last card in a column
   */
  private async getLastCardOrder(
    columnId: string,
    tx?: Transaction | Database,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const lastCard = await txOrDb.query.cards.findFirst({
        where: eq(cards.columnId, columnId),
        orderBy: desc(cards.order),
      });

      return lastCard?.order ?? -1;
    }, tx ?? this.db);
  }

  /**
   * Create a new card
   */
  async create(data: CardCreate, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const lastCardOrder = await this.getLastCardOrder(data.columnId, txOrDb);

      const [card] = await txOrDb
        .insert(cards)
        .values({
          ...data,
          labels: data.labels.map((label) => label.text),
          order: lastCardOrder + 1,
        })
        .returning();

      if (!card) {
        throw new Error("Failed to create card");
      }

      const column = await this.columnService.get(data.columnId, txOrDb);
      const projectId = await this.boardContextService.getProjectId(
        column.boardId,
        txOrDb,
      );

      await this.historyService.recordCardAction(
        card.id,
        projectId,
        "create",
        JSON.stringify({ title: card.title }),
        txOrDb,
      );

      return card;
    }, tx ?? this.db);
  }

  /**
   * Create multiple cards at once
   */
  async createMany(
    boardId: string,
    cardData: CardCreateManyPayload,
    tx?: Transaction | Database,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      if (cardData.length === 0) return [];

      let columnId = cardData[0]!.columnId;

      if (!columnId) {
        const firstColumn = await this.columnService.getFirstColumnByBoardId(
          boardId,
          txOrDb,
        );
        columnId = firstColumn?.id;
      }

      if (!columnId) {
        throw new Error(`Board ${boardId} has no columns to add cards to.`);
      }

      const lastCardOrder = await this.getLastCardOrder(columnId, txOrDb);
      const startOrder = lastCardOrder === -1 ? 0 : lastCardOrder + 1;

      const createdCards = await txOrDb
        .insert(cards)
        .values(
          cardData.map((card, index) => ({
            ...card,
            columnId,
            order: startOrder + index,
            labels: card.labels.map((label) => label.text),
          })),
        )
        .returning();

      const projectId = await this.boardContextService.getProjectId(
        boardId,
        txOrDb,
      );

      for (const card of createdCards) {
        await this.historyService.recordCardAction(
          card.id,
          projectId,
          "create",
          JSON.stringify({ title: card.title }),
          txOrDb,
        );
      }

      return createdCards;
    }, tx ?? this.db);
  }

  /**
   * Get a card by ID
   */
  async get(cardId: number, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const card = await txOrDb.query.cards.findFirst({
        where: eq(cards.id, cardId),
      });

      if (!card) {
        throw new Error("Card not found");
      }

      return card;
    }, tx ?? this.db);
  }

  /**
   * Update a card
   */
  async update(
    cardId: number,
    data: CardUpdatePayload,
    tx?: Transaction | Database,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const existingCard = await this.get(cardId, txOrDb);
      const { userId: actorUserId } = await auth();

      if (!actorUserId) {
        throw new Error("User is not authenticated");
      }

      const updateData = { ...data };

      if (updateData.labels && Array.isArray(updateData.labels)) {
        const firstItem = updateData.labels[0];
        if (firstItem && typeof firstItem === "object" && "text" in firstItem) {
          updateData.labels = (updateData.labels as unknown as Label[]).map(
            (label) => label.text,
          );
        }
      }

      const [card] = await txOrDb
        .update(cards)
        .set(updateData)
        .where(eq(cards.id, cardId))
        .returning();

      if (!card) {
        throw new Error("Failed to update card");
      }

      const projectId = await this.projectService.getProjectIdByCardId(
        cardId,
        txOrDb,
      );

      const changes = JSON.stringify({
        before: existingCard,
        after: card,
      });

      await this.historyService.recordCardAction(
        card.id,
        projectId,
        "update",
        changes,
        txOrDb,
      );

      if (
        updateData.assignedToId !== undefined &&
        updateData.assignedToId !== existingCard.assignedToId &&
        updateData.assignedToId !== null
      ) {
        const assignedProjectUserId = updateData.assignedToId;

        const [assignedProjectUser] = await txOrDb
          .select({ userId: projectUsers.userId })
          .from(projectUsers)
          .where(eq(projectUsers.id, assignedProjectUserId));

        if (assignedProjectUser && assignedProjectUser.userId !== actorUserId) {
          const [actor] = await txOrDb
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, actorUserId));
          const actorName = actor?.name ?? "Someone";

          const [column] = await txOrDb
            .select({ name: columns.name })
            .from(columns)
            .where(eq(columns.id, card.columnId));

          await this.notificationService.create(
            {
              userId: assignedProjectUser.userId,
              projectId,
              entityType: "card",
              entityId: card.id.toString(),
              type: "assignment",
              title: `You were assigned to card "${card.title}"`,
              content: `${actorName} assigned you to the card "${card.title}" in column "${column?.name ?? "Unknown"}".`,
            },
            txOrDb,
          );
        }
      }

      return card;
    }, tx ?? this.db);
  }

  /**
   * Delete a card
   */
  async del(cardId: number, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const card = await this.get(cardId, txOrDb);

      const projectId = await this.projectService.getProjectIdByCardId(
        cardId,
        txOrDb,
      );

      const changes = JSON.stringify({
        before: card,
        after: null,
      });

      await txOrDb
        .update(cards)
        .set({
          order: sql`${cards.order} - 1`,
        })
        .where(
          and(eq(cards.columnId, card.columnId), gt(cards.order, card.order)),
        );

      const [deletedCard] = await txOrDb
        .delete(cards)
        .where(eq(cards.id, cardId))
        .returning();

      if (!deletedCard) {
        throw new Error("Failed to delete card");
      }

      await this.historyService.recordCardAction(
        cardId,
        projectId,
        "delete",
        changes,
        txOrDb,
      );

      return deletedCard;
    }, tx ?? this.db);
  }

  /**
   * Move a card to a different position or column
   */
  async move(data: CardMove, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const { cardId, destinationColumnId, newOrder } = data;
      const card = await this.get(cardId, txOrDb);

      const projectId = await this.projectService.getProjectIdByCardId(
        cardId,
        txOrDb,
      );

      const originalValues = {
        columnId: card.columnId,
        order: card.order,
      };

      if (card.columnId === destinationColumnId) {
        if (card.order === newOrder) {
          return card;
        }

        if (card.order < newOrder) {
          await txOrDb
            .update(cards)
            .set({
              order: sql`${cards.order} - 1`,
            })
            .where(
              and(
                eq(cards.columnId, card.columnId),
                gt(cards.order, card.order),
                lte(cards.order, newOrder),
              ),
            );
        } else {
          await txOrDb
            .update(cards)
            .set({
              order: sql`${cards.order} + 1`,
            })
            .where(
              and(
                eq(cards.columnId, card.columnId),
                lt(cards.order, card.order),
                gte(cards.order, newOrder),
              ),
            );
        }

        const [updatedCardResult] = await txOrDb
          .update(cards)
          .set({
            order: newOrder,
            updatedAt: new Date(),
          })
          .where(eq(cards.id, cardId))
          .returning();

        if (!updatedCardResult) {
          throw new Error("Failed to move card within column");
        }

        const column = await this.columnService.get(card.columnId, txOrDb);

        const changes = JSON.stringify({
          cardTitle: card.title,
          from: {
            ...originalValues,
            columnName: column.name,
          },
          to: {
            columnId: updatedCardResult.columnId,
            order: updatedCardResult.order,
            columnName: column.name,
          },
          sameName: true,
        });

        await this.historyService.recordCardAction(
          cardId,
          projectId,
          "move",
          changes,
          txOrDb,
        );

        return updatedCardResult;
      }

      const destinationColumn = await this.columnService.get(
        destinationColumnId,
        txOrDb,
      );

      const sourceColumn = await this.columnService.get(card.columnId, txOrDb);

      await txOrDb
        .update(cards)
        .set({
          order: sql`${cards.order} - 1`,
        })
        .where(
          and(eq(cards.columnId, card.columnId), gt(cards.order, card.order)),
        );

      await txOrDb
        .update(cards)
        .set({
          order: sql`${cards.order} + 1`,
        })
        .where(
          and(
            eq(cards.columnId, destinationColumnId),
            gte(cards.order, newOrder),
          ),
        );

      const [updatedCardResult] = await txOrDb
        .update(cards)
        .set({
          columnId: destinationColumnId,
          order: newOrder,
          updatedAt: new Date(),
        })
        .where(eq(cards.id, cardId))
        .returning();

      if (!updatedCardResult) {
        throw new Error("Failed to move card to another column");
      }

      const changes = JSON.stringify({
        cardTitle: card.title,
        from: {
          ...originalValues,
          columnName: sourceColumn.name,
        },
        to: {
          columnId: updatedCardResult.columnId,
          order: updatedCardResult.order,
          columnName: destinationColumn.name,
        },
      });

      await this.historyService.recordCardAction(
        cardId,
        projectId,
        "move",
        changes,
        txOrDb,
      );

      return updatedCardResult;
    }, tx ?? this.db);
  }

  /**
   * List all cards in a column
   */
  async list(columnId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      return txOrDb.query.cards.findMany({
        where: eq(cards.columnId, columnId),
        orderBy: asc(cards.order),
        with: {
          assignedTo: {
            with: {
              user: true,
            },
          },
        },
      });
    }, tx ?? this.db);
  }

  /**
   * Count cards by board ID
   */
  async countByBoardId(boardId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const [result] = await txOrDb
        .select({ count: count() })
        .from(cards)
        .innerJoin(columns, eq(cards.columnId, columns.id))
        .where(eq(columns.boardId, boardId));

      return result?.count ?? 0;
    }, tx ?? this.db);
  }

  /**
   * Count completed cards by board ID (cards in columns marked as completed)
   */
  async countCompletedByBoardId(boardId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const [result] = await txOrDb
        .select({ count: count() })
        .from(cards)
        .innerJoin(columns, eq(cards.columnId, columns.id))
        .where(
          and(eq(columns.boardId, boardId), eq(columns.isCompleted, true)),
        );

      return result?.count ?? 0;
    }, tx ?? this.db);
  }
  /**
   * Count cards by project ID
   */
  async countByProjectId(projectId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const [result] = await txOrDb
        .select({ count: count() })
        .from(cards)
        .innerJoin(columns, eq(cards.columnId, columns.id))
        .innerJoin(boards, eq(columns.boardId, boards.id))
        .where(eq(boards.projectId, projectId));

      return result?.count ?? 0;
    }, tx ?? this.db);
  }

  /**
   * Generate cards with AI
   */
  async generate(
    boardId: string,
    prompt: string,
    focusType?: "planning" | "task" | "review",
    detailLevel: "High-Level" | "Standard" | "Detailed" = "Standard",
    tx?: Transaction | Database,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const boardDetails = await this.boardContextService.getBoardDetails(
        boardId,
        txOrDb,
      );

      const effectiveFocusType = focusType ?? "general";
      const goalText = prompt.trim();

      const { object } = await generateObject({
        model: google("gemini-2.0-flash-exp"),
        prompt: `
          You are an AI project management assistant specializing in Kanban methodology. 
          Generate cards that align with our system's structure and constraints:

          IMPORTANT: Avoid generating duplicate cards. Each card should be unique and distinct from existing cards on the board.

          USER REQUEST:
          - Main Goal: "${goalText}"
          - Focus Area: "${effectiveFocusType}" 
          - Detail Level: "${detailLevel}"

          Card Properties:
          - title: Required, max 255 characters, clear and actionable
          - description: Optional, max 1000 characters, with acceptance criteria. Must be in valid HTML format:
            * Use <p> for paragraphs
            * Use <ul>/<li> for lists
            * Use <strong> for bold text
            * Use <em> for italic text
            * Use <h1>, <h2>, <h3> for headings
            * Use <a href="..."> for links
            * No markdown syntax allowed
          - priority: Optional, one of ["low", "medium", "high", "urgent"]
          - dueDate: Optional, valid timestamp
          - labels: Optional array of text labels for categorization
          - order: Required, integer for card positioning
          - columnId: Required, must match an existing column

          Focus Area Guidelines:
          - planning: Generate cards focused on preparation, organization, research, and strategy. These cards represent the initial stages of work.
          - task: Generate cards focused on implementation, execution, and actionable work items. These are the core activities to complete.
          - review: Generate cards focused on testing, evaluation, quality assurance, feedback, and refinement. These represent verification and validation.
          - general: If no focus is specified, provide a balanced mix of cards across different stages.

          Detail Level Guidelines:
          - High-Level: Generate broad, general tasks that capture main objectives. Fewer cards with wider scope.
          - Standard: Generate a balanced mix of tasks with moderate detail. This is the default level of granularity.
          - Detailed: Generate specific, granular tasks broken down into smaller components. More cards with narrower scope.

          Guidelines for Generation:
          1. Uniqueness:
             - Check existing board cards to avoid duplicates
             - Ensure each new card represents a distinct task or feature
             - If similar tasks exist, focus on different aspects or approaches

          2. Title Format:
             - Start with an action verb
             - Be specific and measurable
             - Stay under 255 character limit

          3. Description Format:
             - Use proper HTML structure
             - Include clear acceptance criteria in lists
             - Add implementation details if relevant
             - Stay under 1000 character limit
             - Ensure all HTML tags are properly closed

          4. Priority Assignment:
             - urgent: Immediate attention required
             - high: Important for current sprint
             - medium: Standard priority
             - low: Nice to have

          5. Labels:
             - Use consistent terminology
             - Keep labels concise
             - Align with project context

          6. Maximum Cards:
            - For High-Level detail: Generate 3-5 cards
            - For Standard detail: Generate 5-8 cards
            - For Detailed detail: Generate 8-10 cards

          Board Context (Name and ID):
          - ${JSON.stringify(boardDetails)}

          Based on the provided board context and prompt, generate cards that follow these specifications while maintaining data integrity.
        `,
        schema: CardGenerateResponseSchema,
      });

      return object.cards;
    }, tx ?? this.db);
  }

  /**
   * Generate a single card with AI
   * This is optimized for the new form approach where we need just one high-quality card
   */
  async generateSingle(
    boardId: string,
    prompt: string,
    focusType?: "planning" | "task" | "review",
    detailLevel: "High-Level" | "Standard" | "Detailed" = "Standard",
    tx?: Transaction | Database,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const boardDetails = await this.boardContextService.getBoardDetails(
        boardId,
        txOrDb,
      );

      const effectiveFocusType = focusType ?? "general";
      const goalText = prompt.trim();

      const { object } = await generateObject({
        model: google("gemini-2.0-flash-exp"),
        prompt: `
          You are an AI project management assistant specializing in Kanban methodology.
          Generate a SINGLE high-quality card based on the user's request.
          
          USER REQUEST:
          - Task Description: "${goalText}"
          - Focus Area: "${effectiveFocusType}"
          - Detail Level: "${detailLevel}"
          
          Card Properties:
          - title: Required, max 255 characters, clear and actionable. Start with a verb.
          - description: Detailed HTML content with acceptance criteria. Use proper HTML formatting:
            * <p> for paragraphs
            * <ul>/<li> for lists
            * <strong> for bold text
            * <em> for italic text
            * Use proper heading tags if needed
          - priority: One of ["low", "medium", "high", "urgent"] based on importance
          - labels: 2-4 relevant categorical tags for the card
          
          Focus Area Guidelines:
          - planning: Focus on preparation, organization, research, or strategy.
          - task: Focus on implementation, execution, and actionable work.
          - review: Focus on testing, evaluation, quality checks, or feedback.
          - general: Balanced approach if no specific focus is given.
          
          Detail Level Guidelines:
          - High-Level: Broader scope, more strategic
          - Standard: Balanced detail level
          - Detailed: More specific with clear acceptance criteria
          
          Title Format: Use a clear action verb and be specific
          Description Format: Include a brief overview followed by acceptance criteria in a bulleted list
          Priority: Assign appropriate priority based on urgency and importance
          Labels: Include relevant keywords as labels to categorize the card
          
          Board Context (Name and ID):
          ${boardDetails.name}
          
          Create a SINGLE comprehensive card that addresses the user's request with maximum usefulness.
      `,
        schema: CardGenerateSingleResponseSchema,
      });

      return object.card;
    }, tx ?? this.db);
  }

  /**
   * Assign a card to the current user
   */
  async assignToCurrentUser(cardId: number, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const { userId } = await auth();

      if (!userId) {
        throw new Error("User is not authenticated");
      }

      const projectId = await this.projectService.getProjectIdByCardId(
        cardId,
        txOrDb,
      );

      const projectUser = await this.projectUserService.getCurrentProjectUser(
        projectId,
        txOrDb,
      );

      return this.update(cardId, { assignedToId: projectUser.id }, txOrDb);
    }, tx ?? this.db);
  }

  /**
   * Duplicate a card
   */
  async duplicate(cardId: number, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const originalCard = await this.get(cardId, txOrDb);
      const lastCardOrder = await this.getLastCardOrder(
        originalCard.columnId,
        txOrDb,
      );

      const [newCard] = await txOrDb
        .insert(cards)
        .values({
          ...originalCard,
          id: undefined,
          title: `${originalCard.title} (Copy)`,
          order: lastCardOrder + 1,
          assignedToId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          labels: originalCard.labels ?? [],
        })
        .returning();

      if (!newCard) {
        throw new Error("Failed to duplicate card");
      }

      const projectId = await this.projectService.getProjectIdByCardId(
        newCard.id,
        txOrDb,
      );

      await this.historyService.recordCardAction(
        newCard.id,
        projectId,
        "create",
        JSON.stringify({ title: newCard.title, duplicatedFrom: cardId }),
        txOrDb,
      );

      return newCard;
    }, tx ?? this.db);
  }

  /**
   * Send reminders for cards due soon or overdue
   */
  async sendDueDateReminders(tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const dueCards = await txOrDb
        .select({
          cardId: cards.id,
          cardTitle: cards.title,
          dueDate: cards.dueDate,
          assignedToId: cards.assignedToId,
          userId: projectUsers.userId,
          projectId: boards.projectId,
          columnName: columns.name,
          boardName: boards.name,
        })
        .from(cards)
        .innerJoin(columns, eq(cards.columnId, columns.id))
        .innerJoin(boards, eq(columns.boardId, boards.id))
        .leftJoin(projectUsers, eq(cards.assignedToId, projectUsers.id))
        .where(
          and(
            isNotNull(cards.dueDate),
            lte(cards.dueDate, tomorrow),
            eq(columns.isCompleted, false),
            isNotNull(cards.assignedToId),
          ),
        );

      const notifications = [];
      for (const card of dueCards) {
        if (!card.userId || !card.projectId) continue;

        const dueDate = card.dueDate!;
        const isOverdue = dueDate < today;

        notifications.push({
          userId: card.userId,
          projectId: card.projectId,
          entityType: "card" as const,
          entityId: card.cardId.toString(),
          type: "due_date" as const,
          title: isOverdue
            ? `Card "${card.cardTitle}" is overdue!`
            : `Card "${card.cardTitle}" is due today!`,
          content: `The card "${card.cardTitle}" in column "${card.columnName}" on board "${card.boardName}" ${isOverdue ? "was due on" : "is due today,"} ${dueDate.toLocaleDateString()}.`,
        });
      }

      if (notifications.length > 0) {
        await this.notificationService.createMany(notifications, txOrDb);
        console.log(`Sent ${notifications.length} due date reminders.`);
      } else {
        console.log("No due date reminders to send.");
      }

      return notifications.length;
    }, tx ?? this.db);
  }
}
