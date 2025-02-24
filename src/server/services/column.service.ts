import "server-only";

import { and, asc, eq, gte, sql } from "drizzle-orm";

import { type Database, db, type Transaction } from "../db";
import { columns } from "../db/schema";
import {
  type ColumnCreate,
  type ColumnShiftPayload,
  type ColumnUpdatePayload,
} from "../zod";

async function get(columnId: string, tx: Transaction | Database = db) {
  const column = await tx.query.columns.findFirst({
    where: eq(columns.id, columnId),
  });

  if (!column) {
    throw new Error("Column not found");
  }

  return column;
}

async function create(data: ColumnCreate, tx: Transaction | Database = db) {
  const existingColumns = await list(data.boardId, tx);
  const lastOrder =
    existingColumns.length > 0
      ? Math.max(...existingColumns.map((c) => c.order))
      : -1;

  if (data.order !== undefined) {
    await tx
      .update(columns)
      .set({
        order: sql`${columns.order} + 1`,
        isCompleted: false,
      })
      .where(
        and(eq(columns.boardId, data.boardId), gte(columns.order, data.order)),
      );
  }

  const finalOrder = data.order ?? lastOrder + 1;
  const isLastPosition = finalOrder === lastOrder + 1;

  if (isLastPosition) {
    await tx
      .update(columns)
      .set({ isCompleted: false })
      .where(eq(columns.boardId, data.boardId));
  }

  const [column] = await tx
    .insert(columns)
    .values({
      ...data,
      order: finalOrder,
      isCompleted: isLastPosition,
    })
    .returning();

  if (!column) {
    throw new Error("Error creating column");
  }

  return column;
}

async function createMany(
  data: ColumnCreate[],
  tx: Transaction | Database = db,
) {
  await tx.insert(columns).values(
    data.map((d, index) => ({
      ...d,
      order: d.order ?? index,
    })),
  );
}

async function list(boardId: string, tx: Transaction | Database = db) {
  return tx.query.columns.findMany({
    where: eq(columns.boardId, boardId),
    orderBy: asc(columns.order),
  });
}

async function getFirstColumnByBoardId(
  boardId: string,
  tx: Transaction | Database = db,
) {
  const columns = await list(boardId, tx);

  if (columns.length === 0) {
    throw new Error("No columns found");
  }

  return columns[0]!;
}

async function update(
  columnId: string,
  data: ColumnUpdatePayload,
  tx: Transaction | Database = db,
) {
  const [column] = await tx
    .update(columns)
    .set(data)
    .where(eq(columns.id, columnId))
    .returning();

  if (!column) {
    throw new Error("Error updating column");
  }

  return column;
}

async function shift(
  columnId: string,
  data: ColumnShiftPayload,
  tx: Transaction | Database = db,
) {
  const column = await get(columnId, tx);
  const { direction } = data;

  const allColumns = await list(column.boardId, tx);
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

  const [updatedColumn] = await tx
    .update(columns)
    .set({
      order: adjacentColumn.order,
      isCompleted: isMovingToLast,
    })
    .where(eq(columns.id, columnId))
    .returning();

  await tx
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
}

export const columnService = {
  create,
  createMany,
  list,
  getFirstColumnByBoardId,
  update,
  shift,
};
