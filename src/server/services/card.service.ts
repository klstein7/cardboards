import "server-only";

import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { generateObject, streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { and, asc, count, desc, eq, gt, gte, lt, lte, sql } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { boards, cards, columns, projectUsers } from "../db/schema";
import {
  type CardCreate,
  type CardCreateManyPayload,
  CardGenerateResponseSchema,
  type CardMove,
  type CardUpdatePayload,
} from "../zod";
import { BaseService } from "./base.service";
import { boardService } from "./board.service";
import { columnService } from "./column.service";
import { projectUserService } from "./project-user.service";

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

      return txOrDb
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
   * Update a card's properties
   */
  async update(
    cardId: number,
    data: CardUpdatePayload,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const [updatedCard] = await txOrDb
        .update(cards)
        .set({
          ...data,
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
   * Delete a card
   */
  async del(cardId: number, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const card = await this.get(cardId, txOrDb);

      const [deletedCard] = await txOrDb
        .delete(cards)
        .where(eq(cards.id, cardId))
        .returning();

      if (!deletedCard) {
        throw new Error("Failed to delete card");
      }

      // Update the order of all cards that were after this one
      await txOrDb
        .update(cards)
        .set({
          order: sql`${cards.order} - 1`,
        })
        .where(
          and(eq(cards.columnId, card.columnId), gt(cards.order, card.order)),
        );

      return deletedCard;
    }, tx);
  }

  /**
   * Move a card to a different column and/or position
   */
  async move(data: CardMove, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const { cardId, destinationColumnId, newOrder } = data;
      const card = await this.get(cardId, txOrDb);

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

        const [updatedCard] = await txOrDb
          .update(cards)
          .set({
            order: newOrder,
            updatedAt: new Date(),
          })
          .where(eq(cards.id, cardId))
          .returning();

        return updatedCard;
      }

      // Moving to a different column
      // 1. Update orders in source column
      await txOrDb
        .update(cards)
        .set({
          order: sql`${cards.order} - 1`,
        })
        .where(
          and(eq(cards.columnId, card.columnId), gt(cards.order, card.order)),
        );

      // 2. Update orders in destination column
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

      // 3. Move the card itself
      const [updatedCard] = await txOrDb
        .update(cards)
        .set({
          columnId: destinationColumnId,
          order: newOrder,
          updatedAt: new Date(),
        })
        .where(eq(cards.id, cardId))
        .returning();

      if (!updatedCard) {
        throw new Error("Failed to move card");
      }

      return updatedCard;
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
   * Generate a cards using AI
   */
  async generate(boardId: string, prompt: string) {
    const board = await boardService.getWithDetails(boardId);

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      prompt: `
          You are an AI project management assistant specializing in Kanban methodology. 
          Generate cards that align with our system's structure and constraints:

          IMPORTANT: Avoid generating duplicate cards. Each card should be unique and distinct from existing cards on the board.

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
             - Generate no more than 10 cards.

          Board Context:
          - ${JSON.stringify(board)}

          Based on the provided board context and prompt, generate cards that follow these specifications while maintaining data integrity.

          Prompt:
          ${prompt}
        `,
      schema: CardGenerateResponseSchema,
    });

    return object.cards;
  }

  /**
   * Assign a card to the current user
   */
  async assignToCurrentUser(
    cardId: number,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const { userId } = await auth();

      if (!userId) {
        throw new Error("User is not authenticated");
      }

      // Get the card to find the project
      const card = await this.get(cardId, txOrDb);

      // Get column to find board and project
      const [column] = await txOrDb
        .select({
          boardId: columns.boardId,
        })
        .from(columns)
        .where(eq(columns.id, card.columnId));

      if (!column) {
        throw new Error("Column not found");
      }

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
}

export const cardService = new CardService();
