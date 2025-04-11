import "server-only";

import { eq } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { boards } from "../db/schema";
import { BaseService } from "./base.service";

/**
 * Service for providing essential board context without circular dependencies.
 */
export class BoardContextService extends BaseService {
  constructor(db: Database) {
    super(db);
  }

  /**
   * Get the project ID for a given board ID.
   */
  async getProjectId(
    boardId: string,
    tx?: Transaction | Database,
  ): Promise<string> {
    return this.executeWithTx(async (txOrDb) => {
      const board = await txOrDb.query.boards.findFirst({
        where: eq(boards.id, boardId),
        columns: {
          projectId: true,
        },
      });

      if (!board) {
        throw new Error(`Board context not found for boardId: ${boardId}`);
      }

      return board.projectId;
    }, tx ?? this.db);
  }

  /**
   * Get basic board details (ID, Name, ProjectID) by Board ID.
   * Added to potentially support CardService.generate methods later if needed.
   */
  async getBoardDetails(boardId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const board = await txOrDb.query.boards.findFirst({
        where: eq(boards.id, boardId),
        columns: {
          id: true,
          name: true,
          projectId: true,
        },
      });

      if (!board) {
        throw new Error(`Board context not found for boardId: ${boardId}`);
      }

      return board;
    }, tx ?? this.db);
  }
}
