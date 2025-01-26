import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "../db";
import { boards, cardComments } from "../db/schema";
import { type BoardCreate, type BoardUpdatePayload } from "../zod";
import { columnService } from "./column.service";

async function create(data: BoardCreate) {
  const [board] = await db.insert(boards).values(data).returning();

  if (!board) {
    throw new Error("Failed to create board");
  }

  await columnService.createMany([
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
  ]);

  return board;
}

async function list(projectId: string) {
  return db.query.boards.findMany({
    where: eq(boards.projectId, projectId),
  });
}

async function get(boardId: string) {
  const board = await db.query.boards.findFirst({
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

async function getWithDetails(boardId: string) {
  const board = await db.query.boards.findFirst({
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

async function update(boardId: string, data: BoardUpdatePayload) {
  const [board] = await db
    .update(boards)
    .set(data)
    .where(eq(boards.id, boardId))
    .returning();

  if (!board) {
    throw new Error("Board not found");
  }

  return board;
}

async function del(boardId: string) {
  const [board] = await db
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
