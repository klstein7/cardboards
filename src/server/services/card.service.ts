import "server-only";

import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import { and, asc, count, desc, eq, gt, gte, lt, lte, sql } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { boards, cards, columns } from "../db/schema";
import {
  type CardCreate,
  type CardCreateManyPayload,
  CardGenerateResponseSchema,
  CardGenerateSingleResponseSchema,
  type CardMove,
  type CardUpdatePayload,
} from "../zod";
import { BaseService } from "./base.service";
import { boardService } from "./board.service";
import { columnService } from "./column.service";
import { historyService } from "./history.service";
import { projectService } from "./project.service";
import { projectUserService } from "./project-user.service";

// Type for labels in card create/update
interface Label {
  id: string;
  text: string;
}

/**
 * Service for managing card-related operations
 */
class CardService extends BaseService {
  /**
   * Get the order value for the last card in a column
   */
  private async getLastCardOrder(
    columnId: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const lastCard = await txOrDb.query.cards.findFirst({
        where: eq(cards.columnId, columnId),
        orderBy: desc(cards.order),
      });

      return lastCard?.order ?? -1;
    }, tx);
  }

  /**
   * Create a new card
   */
  async create(data: CardCreate, tx: Transaction | Database = this.db) {
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

      // Get the column and board to get project ID
      const column = await columnService.get(data.columnId, txOrDb);
      const board = await boardService.get(column.boardId, txOrDb);

      // Record history for card creation
      await historyService.recordCardAction(
        card.id,
        board.projectId,
        "create",
        JSON.stringify({ title: card.title }),
        txOrDb,
      );

      return card;
    }, tx);
  }

  /**
   * Create multiple cards at once
   */
  async createMany(
    boardId: string,
    cardData: CardCreateManyPayload,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      if (cardData.length === 0) return [];

      let columnId = cardData[0]!.columnId;

      if (!columnId) {
        const firstColumn = await columnService.getFirstColumnByBoardId(
          boardId,
          txOrDb,
        );
        columnId = firstColumn.id;
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

      // Get the board to get project ID
      const board = await boardService.get(boardId, txOrDb);

      // Record history for each created card
      for (const card of createdCards) {
        await historyService.recordCardAction(
          card.id,
          board.projectId,
          "create",
          JSON.stringify({ title: card.title }),
          txOrDb,
        );
      }

      return createdCards;
    }, tx);
  }

  /**
   * Get a card by ID
   */
  async get(cardId: number, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const card = await txOrDb.query.cards.findFirst({
        where: eq(cards.id, cardId),
      });

      if (!card) {
        throw new Error("Card not found");
      }

      return card;
    }, tx);
  }

  /**
   * Update a card
   */
  async update(
    cardId: number,
    data: CardUpdatePayload,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      // Get the card before update to track changes
      const existingCard = await this.get(cardId, txOrDb);

      // Prepare data for the update
      const updateData = { ...data };

      // Extract text from labels if they are Label objects
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

      // Get project ID for history tracking
      const projectId = await projectService.getProjectIdByCardId(
        cardId,
        txOrDb,
      );

      // Record changes
      const changes = JSON.stringify({
        before: existingCard,
        after: card,
      });

      // Record history for card update
      await historyService.recordCardAction(
        card.id,
        projectId,
        "update",
        changes,
        txOrDb,
      );

      return card;
    }, tx);
  }

  /**
   * Delete a card
   */
  async del(cardId: number, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const card = await this.get(cardId, txOrDb);

      // Get project ID for history tracking
      const projectId = await projectService.getProjectIdByCardId(
        cardId,
        txOrDb,
      );

      // Record the card data before deletion
      const changes = JSON.stringify({
        before: card,
        after: null,
      });

      // Update order of cards after this one
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

      // Record history for card deletion
      await historyService.recordCardAction(
        cardId,
        projectId,
        "delete",
        changes,
        txOrDb,
      );

      return deletedCard;
    }, tx);
  }

  /**
   * Move a card to a different position or column
   */
  async move(data: CardMove, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const { cardId, destinationColumnId, newOrder } = data;
      const card = await this.get(cardId, txOrDb);

      // Get project ID for history tracking
      const projectId = await projectService.getProjectIdByCardId(
        cardId,
        txOrDb,
      );

      // Store original values for history
      const originalValues = {
        columnId: card.columnId,
        order: card.order,
      };

      // If moving within the same column
      if (card.columnId === destinationColumnId) {
        if (card.order === newOrder) {
          return card; // No change needed
        }

        if (card.order < newOrder) {
          // Moving down
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
          // Moving up
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

        // Update the card's order
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

        // Get column name for better history display
        const column = await columnService.get(card.columnId, txOrDb);

        // Record changes with column name and card title
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
          sameName: true, // Indicates it's within the same column
        });

        // Record history for card move
        await historyService.recordCardAction(
          cardId,
          projectId,
          "move",
          changes,
          txOrDb,
        );

        return updatedCardResult;
      }

      // Moving to different column
      // 1. Get the destination column
      const destinationColumn = await columnService.get(
        destinationColumnId,
        txOrDb,
      );

      // Get source column name for history
      const sourceColumn = await columnService.get(card.columnId, txOrDb);

      // 2. Update the order of cards in the original column
      await txOrDb
        .update(cards)
        .set({
          order: sql`${cards.order} - 1`,
        })
        .where(
          and(eq(cards.columnId, card.columnId), gt(cards.order, card.order)),
        );

      // 3. Update the order of cards in the destination column
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

      // 4. Move the card itself
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

      // Record changes with column names for better activity display
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

      // Record history for card move
      await historyService.recordCardAction(
        cardId,
        projectId,
        "move",
        changes,
        txOrDb,
      );

      return updatedCardResult;
    }, tx);
  }

  /**
   * List all cards in a column
   */
  async list(columnId: string, tx: Transaction | Database = this.db) {
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
    }, tx);
  }

  /**
   * Count cards by board ID
   */
  async countByBoardId(boardId: string, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const [result] = await txOrDb
        .select({ count: count() })
        .from(cards)
        .innerJoin(columns, eq(cards.columnId, columns.id))
        .where(eq(columns.boardId, boardId));

      return result?.count ?? 0;
    }, tx);
  }

  /**
   * Count completed cards by board ID (cards in columns marked as completed)
   */
  async countCompletedByBoardId(
    boardId: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const [result] = await txOrDb
        .select({ count: count() })
        .from(cards)
        .innerJoin(columns, eq(cards.columnId, columns.id))
        .where(
          and(eq(columns.boardId, boardId), eq(columns.isCompleted, true)),
        );

      return result?.count ?? 0;
    }, tx);
  }
  /**
   * Count cards by project ID
   */
  async countByProjectId(
    projectId: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const [result] = await txOrDb
        .select({ count: count() })
        .from(cards)
        .innerJoin(columns, eq(cards.columnId, columns.id))
        .innerJoin(boards, eq(columns.boardId, boards.id))
        .where(eq(boards.projectId, projectId));

      return result?.count ?? 0;
    }, tx);
  }

  /**
   * Generate cards with AI
   */
  async generate(
    boardId: string,
    prompt: string,
    focusType?: "planning" | "task" | "review",
    detailLevel: "High-Level" | "Standard" | "Detailed" = "Standard",
  ) {
    const board = await boardService.getWithDetails(boardId);

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

          Board Context:
          - ${JSON.stringify(board)}

          Based on the provided board context and prompt, generate cards that follow these specifications while maintaining data integrity.
        `,
      schema: CardGenerateResponseSchema,
    });

    return object.cards;
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
  ) {
    const board = await boardService.getWithDetails(boardId);

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
          
          Board Context:
          ${board.name}
          
          Create a SINGLE comprehensive card that addresses the user's request with maximum usefulness.
      `,
      schema: CardGenerateSingleResponseSchema,
    });

    return object.card;
  }

  /**
   * Assign a card to the current user
   */
  async assignToCurrentUser(
    cardId: number,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const card = await this.get(cardId, txOrDb);
      const column = await columnService.get(card.columnId, txOrDb);

      // Get board to find project
      const [board] = await txOrDb
        .select({
          projectId: boards.projectId,
        })
        .from(boards)
        .where(eq(boards.id, column.boardId));

      if (!board) {
        throw new Error("Board not found");
      }

      const { userId } = await auth();

      if (!userId) {
        throw new Error("User is not authenticated");
      }

      // Get the project user ID for the current user
      const projectUser = await projectUserService.getCurrentProjectUser(
        board.projectId,
        txOrDb,
      );

      // Update the card with the project user ID
      const [updatedCard] = await txOrDb
        .update(cards)
        .set({
          assignedToId: projectUser.id,
          updatedAt: new Date(),
        })
        .where(eq(cards.id, cardId))
        .returning();

      if (!updatedCard) {
        throw new Error("Card not found");
      }

      return updatedCard;
    }, tx);
  }

  /**
   * Duplicate a card
   */
  async duplicate(cardId: number, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      // Get the existing card
      const existingCard = await this.get(cardId, txOrDb);

      // Get the last card order in the column
      const lastCardOrder = await this.getLastCardOrder(
        existingCard.columnId,
        txOrDb,
      );

      // Create a new card with the same properties but a new order
      const [duplicatedCard] = await txOrDb
        .insert(cards)
        .values({
          title: `${existingCard.title} (Copy)`,
          description: existingCard.description,
          columnId: existingCard.columnId,
          priority: existingCard.priority,
          labels: existingCard.labels,
          order: lastCardOrder + 1,
          // Don't copy assignedToId - leave it unassigned
          // Don't copy dueDate - leave it undefined
        })
        .returning();

      if (!duplicatedCard) {
        throw new Error("Failed to duplicate card");
      }

      // Get the column and board to get project ID
      const column = await columnService.get(duplicatedCard.columnId, txOrDb);
      const board = await boardService.get(column.boardId, txOrDb);

      // Record history for card creation
      await historyService.recordCardAction(
        duplicatedCard.id,
        board.projectId,
        "create",
        JSON.stringify({ title: duplicatedCard.title }),
        txOrDb,
      );

      return duplicatedCard;
    }, tx);
  }
}

export const cardService = new CardService();
