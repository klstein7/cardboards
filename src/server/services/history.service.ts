import "server-only";

import { auth } from "@clerk/nextjs/server";
import { and, count, desc, eq } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { history } from "../db/schema";
import { type HistoryCreate } from "../zod";
import { BaseService } from "./base.service";
import { projectUserService } from "./project-user.service";

/**
 * Service for managing history-related operations
 */
class HistoryService extends BaseService {
  /**
   * Create a new history entry
   */
  async create(data: HistoryCreate, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const { userId } = await auth();

      // If a projectId is provided, get the current user's project user ID
      let performedById: string | undefined = undefined;

      if (data.projectId && userId) {
        try {
          const projectUser = await projectUserService.getCurrentProjectUser(
            data.projectId,
            txOrDb,
          );
          performedById = projectUser.id;
        } catch (error) {
          // If we can't get the project user, just don't set the performedById
          console.error("Could not get project user for history entry:", error);
        }
      }

      const [entry] = await txOrDb
        .insert(history)
        .values({
          ...data,
          performedById,
        })
        .returning();

      if (!entry) {
        throw new Error("Failed to create history entry");
      }

      return entry;
    }, tx);
  }

  /**
   * Get a history entry by ID
   */
  async get(historyId: string, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const entry = await txOrDb.query.history.findFirst({
        where: eq(history.id, historyId),
        with: {
          project: true,
          performedBy: {
            with: {
              user: true,
            },
          },
        },
      });

      if (!entry) {
        throw new Error("History entry not found");
      }

      return entry;
    }, tx);
  }

  /**
   * List history entries for a specific entity
   */
  async listByEntity(
    entityType: HistoryCreate["entityType"],
    entityId: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      // For entity-specific history, we need to verify access to the entity
      // This would typically be handled by the calling service

      return txOrDb.query.history.findMany({
        where: and(
          eq(history.entityType, entityType),
          eq(history.entityId, entityId),
        ),
        orderBy: desc(history.createdAt),
        with: {
          performedBy: {
            with: {
              user: true,
            },
          },
        },
      });
    }, tx);
  }

  /**
   * List history entries for a project
   */
  async listByProject(projectId: string, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      // Verify user can access this project
      // Authentication check removed

      return txOrDb.query.history.findMany({
        where: eq(history.projectId, projectId),
        orderBy: desc(history.createdAt),
        with: {
          performedBy: {
            with: {
              user: true,
            },
          },
        },
      });
    }, tx);
  }

  /**
   * List paginated history entries for a project
   */
  async listByProjectPaginated(
    projectId: string,
    limit = 10,
    offset = 0,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      // Verify user can access this project
      // Authentication check removed

      // Get total count for pagination
      const countResult = await txOrDb
        .select({ totalCount: count() })
        .from(history)
        .where(eq(history.projectId, projectId));

      const total = countResult[0]?.totalCount ?? 0;

      // Get paginated results
      const items = await txOrDb.query.history.findMany({
        where: eq(history.projectId, projectId),
        orderBy: desc(history.createdAt),
        limit: limit,
        offset: offset,
        with: {
          performedBy: {
            with: {
              user: true,
            },
          },
        },
      });

      return {
        items,
        pagination: {
          total: Number(total),
          limit,
          offset,
        },
      };
    }, tx);
  }

  /**
   * Create a history entry for a project-related action
   */
  async recordProjectAction(
    projectId: string,
    action: HistoryCreate["action"],
    changes?: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.create(
      {
        entityType: "project",
        entityId: projectId,
        action,
        projectId,
        changes,
      },
      tx,
    );
  }

  /**
   * Create a history entry for a board-related action
   */
  async recordBoardAction(
    boardId: string,
    projectId: string,
    action: HistoryCreate["action"],
    changes?: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.create(
      {
        entityType: "board",
        entityId: boardId,
        action,
        projectId,
        changes,
      },
      tx,
    );
  }

  /**
   * Create a history entry for a column-related action
   */
  async recordColumnAction(
    columnId: string,
    projectId: string,
    action: HistoryCreate["action"],
    changes?: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.create(
      {
        entityType: "column",
        entityId: columnId,
        action,
        projectId,
        changes,
      },
      tx,
    );
  }

  /**
   * Create a history entry for a card-related action
   */
  async recordCardAction(
    cardId: number,
    projectId: string,
    action: HistoryCreate["action"],
    changes?: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.create(
      {
        entityType: "card",
        entityId: cardId.toString(),
        action,
        projectId,
        changes,
      },
      tx,
    );
  }
}

export const historyService = new HistoryService();
