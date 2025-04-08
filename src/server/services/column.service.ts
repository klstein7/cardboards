import "server-only";

import { auth } from "@clerk/nextjs/server";
import { and, asc, eq, gte, sql } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { columns } from "../db/schema";
import {
  type ColumnCreate,
  type ColumnShiftPayload,
  type ColumnUpdatePayload,
} from "../zod";
import { BaseService } from "./base.service";
import { boardService } from "./board.service";
import { historyService } from "./history.service";
import { notificationService } from "./notification.service";
import { projectService } from "./project.service";
import { projectUserService } from "./project-user.service";

/**
 * Service for managing column operations
 */
class ColumnService extends BaseService {
  /**
   * Get a column by ID
   */
  async get(columnId: string, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const column = await txOrDb.query.columns.findFirst({
        where: eq(columns.id, columnId),
      });

      if (!column) {
        throw new Error("Column not found");
      }

      return column;
    }, tx);
  }

  /**
   * Create a new column
   */
  async create(data: ColumnCreate, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const existingColumns = await this.list(data.boardId, txOrDb);
      const lastOrder =
        existingColumns.length > 0
          ? Math.max(...existingColumns.map((c) => c.order))
          : -1;

      let finalOrder = lastOrder + 1;
      const isCompleted = data.isCompleted ?? false;

      if (data.order !== undefined) {
        // If order is provided, need to shift existing columns
        finalOrder = data.order;
        await txOrDb
          .update(columns)
          .set({
            order: sql`${columns.order} + 1`,
          })
          .where(
            and(
              eq(columns.boardId, data.boardId),
              gte(columns.order, finalOrder),
            ),
          );
      }

      // Create column with calculated order and isCompleted values
      const [column] = await txOrDb
        .insert(columns)
        .values({
          ...data,
          order: finalOrder,
          isCompleted,
        })
        .returning();

      if (!column) {
        throw new Error("Failed to create column");
      }

      // Get project ID from board for history tracking
      const board = await boardService.get(data.boardId, txOrDb);

      // Record history for column creation
      await historyService.recordColumnAction(
        column.id,
        board.projectId,
        "create",
        undefined,
        txOrDb,
      );

      return column;
    }, tx);
  }

  /**
   * Create multiple columns at once
   */
  async createMany(data: ColumnCreate[], tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      await txOrDb.insert(columns).values(
        data.map((d, index) => ({
          ...d,
          order: d.order ?? index,
        })),
      );
    }, tx);
  }

  /**
   * List all columns for a board
   */
  async list(boardId: string, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      return txOrDb.query.columns.findMany({
        where: eq(columns.boardId, boardId),
        orderBy: asc(columns.order),
      });
    }, tx);
  }

  /**
   * Get the first column for a board
   */
  async getFirstColumnByBoardId(
    boardId: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const columns = await this.list(boardId, txOrDb);

      if (columns.length === 0) {
        throw new Error("No columns found");
      }

      return columns[0]!;
    }, tx);
  }

  /**
   * Update a column
   */
  async update(
    columnId: string,
    data: ColumnUpdatePayload,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      // Get the column before update to track changes
      const existingColumn = await this.get(columnId, txOrDb);

      const [column] = await txOrDb
        .update(columns)
        .set(data)
        .where(eq(columns.id, columnId))
        .returning();

      if (!column) {
        throw new Error("Failed to update column");
      }

      // Get board for project ID
      const board = await boardService.get(column.boardId, txOrDb);

      // Record changes
      const changes = JSON.stringify({
        before: existingColumn,
        after: column,
      });

      // Record history for column update
      await historyService.recordColumnAction(
        column.id,
        board.projectId,
        "update",
        changes,
        txOrDb,
      );

      // Notify project members if the column name changed
      if (data.name && data.name !== existingColumn.name) {
        const { userId: actorUserId } = await auth();
        if (!actorUserId) {
          throw new Error("User not authenticated");
        }

        const members = await projectUserService.list(board.projectId, txOrDb);
        const project = await projectService.get(board.projectId, txOrDb);

        const notificationsData = members
          .filter((member) => member.userId !== actorUserId) // Don't notify the actor
          .map((member) => ({
            userId: member.userId,
            projectId: board.projectId,
            entityType: "column" as const,
            entityId: column.id,
            type: "column_update" as const,
            title: `Column "${existingColumn.name}" renamed`,
            content: `In project "${project.name}", the column "${existingColumn.name}" was renamed to "${column.name}".`,
          }));

        if (notificationsData.length > 0) {
          await notificationService.createMany(notificationsData, txOrDb);
        }
      }

      return column;
    }, tx);
  }

  /**
   * Delete a column
   */
  async del(columnId: string, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const column = await this.get(columnId, txOrDb);

      // Get board for project ID
      const board = await boardService.get(column.boardId, txOrDb);

      // Notify members BEFORE deleting
      const { userId: actorUserId } = await auth();
      if (!actorUserId) {
        throw new Error("User not authenticated");
      }

      const members = await projectUserService.list(board.projectId, txOrDb);
      const project = await projectService.get(board.projectId, txOrDb);

      const notificationsData = members
        .filter((member) => member.userId !== actorUserId)
        .map((member) => ({
          userId: member.userId,
          projectId: board.projectId,
          entityType: "column" as const,
          entityId: column.id,
          type: "column_update" as const,
          title: `Column "${column.name}" deleted`,
          content: `In project "${project.name}", the column "${column.name}" was deleted.`,
        }));

      if (notificationsData.length > 0) {
        await notificationService.createMany(notificationsData, txOrDb);
      }

      // Record the column data before deletion
      const changes = JSON.stringify({
        before: column,
        after: null,
      });

      // Update order of columns after this one
      await txOrDb
        .update(columns)
        .set({
          order: sql`${columns.order} - 1`,
        })
        .where(
          and(
            eq(columns.boardId, column.boardId),
            gte(columns.order, column.order),
          ),
        );

      const [deletedColumn] = await txOrDb
        .delete(columns)
        .where(eq(columns.id, columnId))
        .returning();

      if (!deletedColumn) {
        throw new Error("Failed to delete column");
      }

      // Record history for column deletion
      await historyService.recordColumnAction(
        column.id,
        board.projectId,
        "delete",
        changes,
        txOrDb,
      );

      return deletedColumn;
    }, tx);
  }

  /**
   * Shift a column to a new position
   */
  async shift(
    columnId: string,
    data: ColumnShiftPayload,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const column = await this.get(columnId, txOrDb);
      const { direction } = data;

      const allColumns = await this.list(column.boardId, txOrDb);
      const currentIndex = allColumns.findIndex((c) => c.id === columnId);

      if (
        (direction === "up" && currentIndex === 0) ||
        (direction === "down" && currentIndex === allColumns.length - 1)
      ) {
        return column;
      }

      const adjacentIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;
      const adjacentColumn = allColumns[adjacentIndex]!;

      const [updatedColumn] = await txOrDb
        .update(columns)
        .set({
          order: adjacentColumn.order,
        })
        .where(eq(columns.id, columnId))
        .returning();

      await txOrDb
        .update(columns)
        .set({
          order: column.order,
        })
        .where(eq(columns.id, adjacentColumn.id));

      if (!updatedColumn) {
        throw new Error("Error shifting column");
      }

      // After successful shift operation, add history tracking
      // Get the column after shift
      const updatedColumnAfter = await this.get(columnId, txOrDb);
      const board = await boardService.get(updatedColumnAfter.boardId, txOrDb);

      // Record the move action
      const changes = JSON.stringify({
        from: { order: column.order },
        to: { order: updatedColumnAfter.order },
      });

      await historyService.recordColumnAction(
        columnId,
        board.projectId,
        "move",
        changes,
        txOrDb,
      );

      return updatedColumn;
    }, tx);
  }
}

export const columnService = new ColumnService();
