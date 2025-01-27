import "server-only";

import { eq } from "drizzle-orm";

import { type Database, db, type Transaction } from "../db";
import { boards } from "../db/schema";
import { type BoardCreate, type BoardUpdatePayload } from "../zod";
import { columnService } from "./column.service";

async function create(data: BoardCreate, tx: Transaction | Database = db) {
  const [board] = await tx.insert(boards).values(data).returning();

  if (!board) {
    throw new Error("Failed to create board");
  }

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
    tx,
  );

  return board;
}

async function list(projectId: string, tx: Transaction | Database = db) {
  return tx.query.boards.findMany({
    where: eq(boards.projectId, projectId),
  });
}

async function get(boardId: string, tx: Transaction | Database = db) {
  const board = await tx.query.boards.findFirst({
    where: eq(boards.id, boardId),
    with: {
      columns: true,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  return board;
}

async function getWithDetails(
  boardId: string,
  tx: Transaction | Database = db,
) {
  const board = await tx.query.boards.findFirst({
    where: eq(boards.id, boardId),
    with: {
      columns: {
        with: {
          cards: true,
        },
      },
    },
  });

  return board;
}

async function update(
  boardId: string,
  data: BoardUpdatePayload,
  tx: Transaction | Database = db,
) {
  const [board] = await tx
    .update(boards)
    .set(data)
    .where(eq(boards.id, boardId))
    .returning();

  if (!board) {
    throw new Error("Board not found");
  }

  return board;
}

async function del(boardId: string, tx: Transaction | Database = db) {
  const [board] = await tx
    .delete(boards)
    .where(eq(boards.id, boardId))
    .returning();

  if (!board) {
    throw new Error("Error deleting board");
  }

  return board;
}

export const boardService = {
  create,
  list,
  get,
  getWithDetails,
  update,
  del,
};
