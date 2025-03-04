import "server-only";

import { and, asc, eq, gte, sql } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { columns } from "../db/schema";
import {
  type ColumnCreate,
  type ColumnShiftPayload,
  type ColumnUpdatePayload,
} from "../zod";
import { authService } from "./auth.service";
import { BaseService } from "./base.service";

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
      // Verify admin access for the board
      await authService.requireBoardAdmin(data.boardId, txOrDb);

      const existingColumns = await this.list(data.boardId, txOrDb);
      const lastOrder =
        existingColumns.length > 0
          ? Math.max(...existingColumns.map((c) => c.order))
          : -1;

      if (data.order !== undefined) {
        await txOrDb
          .update(columns)
          .set({
            order: sql`${columns.order} + 1`,
            isCompleted: false,
          })
          .where(
            and(
              eq(columns.boardId, data.boardId),
              gte(columns.order, data.order),
            ),
          );
      }

      const finalOrder = data.order ?? lastOrder + 1;
      const isLastPosition = finalOrder === lastOrder + 1;

      if (isLastPosition) {
        await txOrDb
          .update(columns)
          .set({ isCompleted: false })
          .where(eq(columns.boardId, data.boardId));
      }

      const [column] = await txOrDb
        .insert(columns)
        .values({
          ...data,
          order: finalOrder,
          isCompleted: data.isCompleted ?? isLastPosition,
        })
        .returning();

      if (!column) {
        throw new Error("Failed to create column");
      }

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
      // Verify admin access
      await authService.requireColumnAdmin(columnId, txOrDb);

      const [column] = await txOrDb
        .update(columns)
        .set(data)
        .where(eq(columns.id, columnId))
        .returning();

      if (!column) {
        throw new Error("Failed to update column");
      }

      return column;
    }, tx);
  }

  /**
   * Delete a column
   */
  async del(columnId: string, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      // Verify admin access
      await authService.requireColumnAdmin(columnId, txOrDb);

      const column = await this.get(columnId, txOrDb);

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
      // Verify admin access
      await authService.requireColumnAdmin(columnId, txOrDb);

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
      const isMovingToLast =
        direction === "down" && adjacentIndex === allColumns.length - 1;
      const isMovingFromLast =
        direction === "up" && currentIndex === allColumns.length - 1;

      const [updatedColumn] = await txOrDb
        .update(columns)
        .set({
          order: adjacentColumn.order,
          isCompleted: isMovingToLast,
        })
        .where(eq(columns.id, columnId))
        .returning();

      await txOrDb
        .update(columns)
        .set({
          order: column.order,
          isCompleted: isMovingFromLast,
        })
        .where(eq(columns.id, adjacentColumn.id));

      if (!updatedColumn) {
        throw new Error("Error shifting column");
      }

      return updatedColumn;
    }, tx);
  }
}

export const columnService = new ColumnService();
