import "server-only";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { boards, cards, columns, projectUsers } from "../db/schema";
import { BaseService } from "./base.service";
import { type ProjectUserService } from "./project-user.service";

/**
 * Service for handling authorization and authentication
 */
export class AuthService extends BaseService {
  private readonly projectUserService: ProjectUserService;

  constructor(db: Database, projectUserService: ProjectUserService) {
    super(db);
    this.projectUserService = projectUserService;
  }

  /**
   * Verify the current user has admin rights in the project
   */
  async requireProjectAdmin(projectId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const projectUser = await this.projectUserService.getCurrentProjectUser(
        projectId,
        txOrDb,
      );

      if (projectUser.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      return projectUser;
    }, tx ?? this.db);
  }

  /**
   * Verify the current user can access the specified board
   */
  async canAccessBoard(boardId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const { userId } = await auth();

      if (!userId) {
        throw new Error("Unauthorized: You must be logged in");
      }

      const [board] = await txOrDb
        .select({
          id: boards.id,
          projectId: boards.projectId,
        })
        .from(boards)
        .where(eq(boards.id, boardId));

      if (!board) {
        throw new Error("Board not found");
      }

      await this.canAccessProject(board.projectId, txOrDb);

      return board;
    }, tx ?? this.db);
  }

  /**
   * Verify the current user has admin rights for the specified board
   */
  async requireBoardAdmin(boardId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const board = await this.canAccessBoard(boardId, txOrDb);

      // Check if user has admin rights for the board's project
      await this.requireProjectAdmin(board.projectId, txOrDb);

      return board;
    }, tx ?? this.db);
  }

  /**
   * Verify the current user can access the specified card
   */
  async canAccessCard(cardId: number, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const { userId } = await auth();

      if (!userId) {
        throw new Error("Unauthorized: You must be logged in");
      }

      const [card] = await txOrDb
        .select({
          id: cards.id,
          columnId: cards.columnId,
        })
        .from(cards)
        .where(eq(cards.id, cardId));

      if (!card) {
        throw new Error("Card not found");
      }

      await this.canAccessColumn(card.columnId, txOrDb);

      return card;
    }, tx ?? this.db);
  }

  /**
   * Verify the current user has admin rights for the specified card
   */
  async requireCardAdmin(cardId: number, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const card = await this.canAccessCard(cardId, txOrDb);

      // Get the column to find the board
      const [column] = await txOrDb
        .select({
          boardId: columns.boardId,
        })
        .from(columns)
        .where(eq(columns.id, card.columnId));

      if (!column) {
        throw new Error("Column not found");
      }

      // Find the board to get the project
      const [board] = await txOrDb
        .select({
          projectId: boards.projectId,
        })
        .from(boards)
        .where(eq(boards.id, column.boardId));

      if (!board) {
        throw new Error("Board not found");
      }

      // Check if user has admin rights for the project
      await this.requireProjectAdmin(board.projectId, txOrDb);

      return card;
    }, tx ?? this.db);
  }

  /**
   * Verify the current user can access the specified column
   */
  async canAccessColumn(columnId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const { userId } = await auth();

      if (!userId) {
        throw new Error("Unauthorized: You must be logged in");
      }

      const [column] = await txOrDb
        .select({
          id: columns.id,
          boardId: columns.boardId,
        })
        .from(columns)
        .where(eq(columns.id, columnId));

      if (!column) {
        throw new Error("Column not found");
      }

      await this.canAccessBoard(column.boardId, txOrDb);

      return column;
    }, tx ?? this.db);
  }

  /**
   * Verify the current user has admin rights for the specified column
   */
  async requireColumnAdmin(columnId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const column = await this.canAccessColumn(columnId, txOrDb);

      // Find the board to get the project
      const [board] = await txOrDb
        .select({
          projectId: boards.projectId,
        })
        .from(boards)
        .where(eq(boards.id, column.boardId));

      if (!board) {
        throw new Error("Board not found");
      }

      // Check if user has admin rights for the project
      await this.requireProjectAdmin(board.projectId, txOrDb);

      return column;
    }, tx ?? this.db);
  }

  /**
   * Verify the current user can access the specified project
   */
  async canAccessProject(projectId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const { userId } = await auth();

      if (!userId) {
        throw new Error("Unauthorized: You must be logged in");
      }

      const [projectUser] = await txOrDb
        .select()
        .from(projectUsers)
        .where(
          and(
            eq(projectUsers.projectId, projectId),
            eq(projectUsers.userId, userId),
          ),
        );

      if (!projectUser) {
        throw new Error("Unauthorized: You don't have access to this project");
      }

      return projectUser;
    }, tx ?? this.db);
  }

  /**
   * Check if the current user is an admin for the specified project
   * This is a non-throwing version of requireProjectAdmin
   */
  async isProjectAdmin(projectId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      try {
        const projectUser = await this.projectUserService.getCurrentProjectUser(
          projectId,
          txOrDb,
        );

        return projectUser.role === "admin";
      } catch (error) {
        console.error("Error checking if user is project admin", error);
        return false;
      }
    }, tx ?? this.db);
  }
}
