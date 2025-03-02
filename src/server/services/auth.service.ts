import "server-only";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { boards, cards, columns, projectUsers } from "../db/schema";
import { BaseService } from "./base.service";
import { projectUserService } from "./project-user.service";

/**
 * Service for handling authorization and authentication
 */
class AuthService extends BaseService {
  /**
   * Verify the current user has admin rights in the project
   */
  async requireProjectAdmin(
    projectId: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const projectUser = await projectUserService.getCurrentProjectUser(
        projectId,
        txOrDb,
      );

      if (projectUser.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      return projectUser;
    }, tx);
  }

  /**
   * Verify the current user can access the specified board
   */
  async canAccessBoard(boardId: string, tx: Transaction | Database = this.db) {
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
    }, tx);
  }

  /**
   * Verify the current user can access the specified card
   */
  async canAccessCard(cardId: number, tx: Transaction | Database = this.db) {
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
    }, tx);
  }

  /**
   * Verify the current user can access the specified column
   */
  async canAccessColumn(
    columnId: string,
    tx: Transaction | Database = this.db,
  ) {
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
    }, tx);
  }

  /**
   * Verify the current user can access the specified project
   */
  async canAccessProject(
    projectId: string,
    tx: Transaction | Database = this.db,
  ) {
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
    }, tx);
  }
}

export const authService = new AuthService();
