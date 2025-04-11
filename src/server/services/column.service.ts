import "server-only";

import { auth } from "@clerk/nextjs/server";
import { and, asc, eq, gte, type InferSelectModel, sql } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { columns, type projectUsers } from "../db/schema";
import {
  type ColumnCreate,
  type ColumnShiftPayload,
  type ColumnUpdatePayload,
} from "../zod";
import { BaseService } from "./base.service";
import { type BoardContextService } from "./board-context.service";
import { type HistoryService } from "./history.service";
import { type NotificationService } from "./notification.service";
import { type ProjectService } from "./project.service";
import { type ProjectUserService } from "./project-user.service";

// Define local type for ProjectUser
type ProjectUser = InferSelectModel<typeof projectUsers>;

/**
 * Service for managing column operations
 */
export class ColumnService extends BaseService {
  private readonly boardContextService: BoardContextService;
  private readonly historyService: HistoryService;
  private readonly notificationService: NotificationService;
  private readonly projectService: ProjectService;
  private readonly projectUserService: ProjectUserService;

  constructor(
    db: Database,
    boardContextService: BoardContextService,
    historyService: HistoryService,
    notificationService: NotificationService,
    projectService: ProjectService,
    projectUserService: ProjectUserService,
  ) {
    super(db);
    this.boardContextService = boardContextService;
    this.historyService = historyService;
    this.notificationService = notificationService;
    this.projectService = projectService;
    this.projectUserService = projectUserService;
  }

  /**
   * Get a column by ID
   */
  async get(columnId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const column = await txOrDb.query.columns.findFirst({
        where: eq(columns.id, columnId),
      });

      if (!column) {
        throw new Error("Column not found");
      }

      return column;
    }, tx ?? this.db);
  }

  /**
   * Create a new column
   */
  async create(data: ColumnCreate, tx?: Transaction | Database) {
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

      // Use injected context service to get projectId
      const projectId = await this.boardContextService.getProjectId(
        data.boardId,
        txOrDb,
      );

      // Use injected service
      await this.historyService.recordColumnAction(
        column.id,
        projectId,
        "create",
        undefined,
        txOrDb,
      );

      return column;
    }, tx ?? this.db);
  }

  /**
   * Create multiple columns at once
   */
  async createMany(data: ColumnCreate[], tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      await txOrDb.insert(columns).values(
        data.map((d, index) => ({
          ...d,
          order: d.order ?? index,
        })),
      );
    }, tx ?? this.db);
  }

  /**
   * List all columns for a board
   */
  async list(boardId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      return txOrDb.query.columns.findMany({
        where: eq(columns.boardId, boardId),
        orderBy: asc(columns.order),
      });
    }, tx ?? this.db);
  }

  /**
   * Get the first column for a board
   */
  async getFirstColumnByBoardId(boardId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const columns = await this.list(boardId, txOrDb);

      if (columns.length === 0) {
        throw new Error("No columns found");
      }

      return columns[0]!;
    }, tx ?? this.db);
  }

  /**
   * Update a column
   */
  async update(
    columnId: string,
    data: ColumnUpdatePayload,
    tx?: Transaction | Database,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const existingColumn = await this.get(columnId, txOrDb);

      const [column] = await txOrDb
        .update(columns)
        .set(data)
        .where(eq(columns.id, columnId))
        .returning();

      if (!column) {
        throw new Error("Failed to update column");
      }

      // Use injected context service to get projectId
      const projectId = await this.boardContextService.getProjectId(
        column.boardId,
        txOrDb,
      );

      // Record changes
      const changes = JSON.stringify({
        before: existingColumn,
        after: column,
      });

      // Use injected service
      await this.historyService.recordColumnAction(
        column.id,
        projectId,
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

        // Use injected services
        const members = await this.projectUserService.list(projectId, txOrDb);
        const project = await this.projectService.get(projectId, txOrDb);

        const notificationsData = members
          .filter((member: ProjectUser) => member.userId !== actorUserId)
          .map((member: ProjectUser) => ({
            userId: member.userId,
            projectId: projectId,
            entityType: "column" as const,
            entityId: column.id,
            type: "column_update" as const,
            title: `Column "${existingColumn.name}" renamed`,
            content: `In project "${project.name}", the column "${existingColumn.name}" was renamed to "${column.name}".`,
          }));

        if (notificationsData.length > 0) {
          // Use injected service
          await this.notificationService.createMany(notificationsData, txOrDb);
        }
      }

      return column;
    }, tx ?? this.db);
  }

  /**
   * Delete a column
   */
  async del(columnId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const column = await this.get(columnId, txOrDb);

      // Use injected context service to get projectId
      const projectId = await this.boardContextService.getProjectId(
        column.boardId,
        txOrDb,
      );

      // Notify members BEFORE deleting
      const { userId: actorUserId } = await auth();
      if (!actorUserId) {
        throw new Error("User not authenticated");
      }

      // Use injected services
      const members = await this.projectUserService.list(projectId, txOrDb);
      const project = await this.projectService.get(projectId, txOrDb);

      const notificationsData = members
        .filter((member: ProjectUser) => member.userId !== actorUserId)
        .map((member: ProjectUser) => ({
          userId: member.userId,
          projectId: projectId,
          entityType: "column" as const,
          entityId: column.id,
          type: "column_update" as const,
          title: `Column "${column.name}" deleted`,
          content: `In project "${project.name}", the column "${column.name}" was deleted.`,
        }));

      if (notificationsData.length > 0) {
        // Use injected service
        await this.notificationService.createMany(notificationsData, txOrDb);
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

      // Use injected service
      await this.historyService.recordColumnAction(
        column.id,
        projectId,
        "delete",
        changes,
        txOrDb,
      );

      return deletedColumn;
    }, tx ?? this.db);
  }

  /**
   * Shift a column to a new position
   */
  async shift(
    columnId: string,
    data: ColumnShiftPayload,
    tx?: Transaction | Database,
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

      // Use injected service to get projectId
      const updatedColumnAfter = await this.get(columnId, txOrDb);
      const projectId = await this.boardContextService.getProjectId(
        updatedColumnAfter.boardId,
        txOrDb,
      );

      // Record the move action
      const changes = JSON.stringify({
        from: { order: column.order },
        to: { order: updatedColumnAfter.order },
      });

      // Use injected service
      await this.historyService.recordColumnAction(
        columnId,
        projectId,
        "move",
        changes,
        txOrDb,
      );

      return updatedColumn;
    }, tx ?? this.db);
  }
}
