import "server-only";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { count, eq } from "drizzle-orm";

import { type Color, COLORS } from "~/lib/utils";

import { type Database, type Transaction } from "../db";
import { boards } from "../db/schema";
import {
  type BoardCreate,
  BoardGenerateResponseSchema,
  type BoardUpdatePayload,
} from "../zod";
import { authService } from "./auth.service";
import { BaseService } from "./base.service";
import { cardService } from "./card.service";
import { columnService } from "./column.service";
import { historyService } from "./history.service";
import { projectService } from "./project.service";

/**
 * Service for managing board-related operations
 */
class BoardService extends BaseService {
  /**
   * Create a new board with optional custom columns
   */
  async create(
    data: BoardCreate,
    customColumns?: { name: string; order: number; isCompleted: boolean }[],
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const colorKeys = Object.keys(COLORS) as Color[];
      let randomColorKey =
        colorKeys[Math.floor(Math.random() * colorKeys.length)];

      if (!randomColorKey) {
        randomColorKey = "blue";
      }

      const randomColorHex = COLORS[randomColorKey];

      const [board] = await txOrDb
        .insert(boards)
        .values({
          ...data,
          color: data.color ?? randomColorHex,
        })
        .returning();

      if (!board) {
        throw new Error("Failed to create board");
      }

      // Record history for board creation
      await historyService.recordBoardAction(
        board.id,
        board.projectId,
        "create",
        undefined,
        txOrDb,
      );

      if (customColumns) {
        await columnService.createMany(
          customColumns.map((column) => ({
            boardId: board.id,
            ...column,
          })),
          txOrDb,
        );
      } else {
        // Create default columns
        await columnService.createMany(
          [
            {
              boardId: board.id,
              name: "Todo",
              order: 0,
            },
            {
              boardId: board.id,
              name: "In Progress",
              order: 1,
            },
            {
              boardId: board.id,
              name: "Done",
              order: 2,
              isCompleted: true,
            },
          ],
          txOrDb,
        );
      }

      return board;
    }, tx);
  }

  /**
   * List all boards for a project
   */
  async list(projectId: string, tx: Transaction | Database = this.db) {
    return this.executeWithTx(
      (txOrDb) =>
        txOrDb.select().from(boards).where(eq(boards.projectId, projectId)),
      tx,
    );
  }

  /**
   * Get a board by ID
   */
  async get(boardId: string, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const [board] = await txOrDb
        .select()
        .from(boards)
        .where(eq(boards.id, boardId));

      if (!board) {
        throw new Error("Board not found");
      }

      return board;
    }, tx);
  }

  /**
   * Get a board with all its details (columns and cards)
   */
  async getWithDetails(boardId: string, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const board = await this.get(boardId, txOrDb);
      const columns = await columnService.list(board.id, txOrDb);

      const cards = [];
      for (const column of columns) {
        const columnCards = await cardService.list(column.id, txOrDb);
        cards.push(...columnCards);
      }

      return {
        ...board,
        columns,
        cards,
      };
    }, tx);
  }

  /**
   * Update a board
   */
  async update(
    boardId: string,
    data: BoardUpdatePayload,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      // Verify admin access
      await authService.requireBoardAdmin(boardId, txOrDb);

      // Get the board before update to track changes
      const existingBoard = await txOrDb.query.boards.findFirst({
        where: eq(boards.id, boardId),
      });

      if (!existingBoard) {
        throw new Error("Board not found");
      }

      const [board] = await txOrDb
        .update(boards)
        .set(data)
        .where(eq(boards.id, boardId))
        .returning();

      if (!board) {
        throw new Error("Failed to update board");
      }

      // Record changes
      const changes = JSON.stringify({
        before: existingBoard,
        after: board,
      });

      // Record history for board update
      await historyService.recordBoardAction(
        board.id,
        board.projectId,
        "update",
        changes,
        txOrDb,
      );

      return board;
    }, tx);
  }

  /**
   * Delete a board
   */
  async del(boardId: string, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      // Verify admin access
      await authService.requireBoardAdmin(boardId, txOrDb);

      // Get the board before deletion to record in history
      const board = await txOrDb.query.boards.findFirst({
        where: eq(boards.id, boardId),
      });

      if (!board) {
        throw new Error("Board not found");
      }

      // Record the board data before deletion
      const changes = JSON.stringify({
        before: board,
        after: null,
      });

      const deletedBoard = await txOrDb
        .delete(boards)
        .where(eq(boards.id, boardId))
        .returning();

      if (!deletedBoard || deletedBoard.length === 0) {
        throw new Error("Failed to delete board");
      }

      // Record history for board deletion
      await historyService.recordBoardAction(
        board.id,
        board.projectId,
        "delete",
        changes,
        txOrDb,
      );

      return board;
    }, tx);
  }

  /**
   * Generate board content with AI
   */
  async generate(
    projectId: string,
    prompt: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      // Verify admin access for the project
      await authService.requireProjectAdmin(projectId, txOrDb);

      const project = await projectService.get(projectId, txOrDb);

      const response = await generateObject({
        model: google("gemini-2.0-flash-exp"),
        prompt: `
          You are an AI project management assistant specializing in simple, minimal Kanban boards.
          Create a straightforward board that helps users start quickly and maintain focus.

          PROJECT CONTEXT:
          ${JSON.stringify(project)}

          USER REQUEST:
          ${prompt}

          CORE PRINCIPLES:
          1. Simplicity is key - use 3-5 columns
          2. Column names should reflect the project's context
          3. Make the workflow progression obvious
          4. Use language that resonates with the project domain
 
          WORKFLOW STRUCTURE:
          Create a flow with 3-5 columns. Examples:
          
          For expense tracking (4 columns):
            Columns: "To Claim" → "Preparing" → "In Review" → "Reimbursed"
            Starter cards: 
              - Title: "EXAMPLE: Office supplies from Staples"
                Description: "<p>Receipt for printer paper and ink cartridges - $127.50</p><ul><li>Receipt attached</li><li>Purchased on March 15</li><li>Department: Engineering</li></ul>"
                Priority: "medium"
                Labels: ["office-supplies", "q1-2024"]
              - Title: "EXAMPLE: Client lunch meeting at Cafe Luna"
                Description: "<p>Business lunch with client on March 15 - $45.80</p><ul><li>Attendees: 3</li><li>Client: Acme Corp</li><li>Receipt needed</li></ul>"
                Priority: "medium"
                Labels: ["meals", "client-meeting"]
 
          For recruitment (5 columns):
            Columns: "To Screen" → "Initial Call" → "Technical" → "Final Round" → "Hired"
            Starter cards:
              - Title: "EXAMPLE: Senior Developer application - Jane Smith"
                Description: "<p>Resume received on March 16</p><ul><li>5 years React experience</li><li>Currently at Tech Corp</li><li>Salary range: $120-150k</li></ul>"
                Priority: "high"
                Labels: ["engineering", "senior-level"]
              - Title: "EXAMPLE: Product Manager application - John Doe"
                Description: "<p>Internal referral from Marketing team</p><ul><li>3 years at Google</li><li>MBA from Stanford</li><li>Available in 2 months</li></ul>"
                Priority: "medium"
                Labels: ["product", "referral"]
 
          TECHNICAL REQUIREMENTS:
          1. Create 3-5 columns with contextual names
          2. Only the final column should have isCompleted: true
          3. First column only:
             - 2 starter tasks that:
             - Must prefix titles with "EXAMPLE: "
             - Include HTML-formatted descriptions with <p> and <ul>/<li> tags
             - Set appropriate priority ("low", "medium", "high", "urgent")
             - Add relevant context-specific labels
             - Match the board's specific purpose
          4. Column names should show clear progression
          5. Number of columns should make sense for the workflow
        `,
        schema: BoardGenerateResponseSchema,
      });

      // Process the AI response - adjust to match your schema
      const responseData = response.object;

      // Create the board with the provided columns
      const board = await this.create(
        {
          name: responseData.name,
          projectId,
        },
        responseData.columns,
        txOrDb,
      );

      // Add the generated cards to their respective columns
      const boardColumns = await columnService.list(board.id, txOrDb);

      // Create all cards - you might need to adjust this based on your card schema
      // This is a placeholder based on the error messages we saw
      const firstColumn = boardColumns[0];
      if (firstColumn) {
        const cardsToCreate = responseData.columns[0]?.cards ?? [];
        if (cardsToCreate.length > 0) {
          await cardService.createMany(
            board.id,
            cardsToCreate.map((card) => ({
              title: card.title,
              description: card.description,
              columnId: firstColumn.id,
              labels: [],
              priority: "medium",
            })),
            txOrDb,
          );
        }
      }

      return this.getWithDetails(board.id, txOrDb);
    }, tx);
  }

  /**
   * Count the number of boards in a project
   */
  async countByProjectId(
    projectId: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const [result] = await txOrDb
        .select({ count: count() })
        .from(boards)
        .where(eq(boards.projectId, projectId));

      return result?.count ?? 0;
    }, tx);
  }
}

export const boardService = new BoardService();
