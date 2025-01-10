import "server-only";

import { eq } from "drizzle-orm";

import { db } from "../db";
import { boards } from "../db/schema";
import { type BoardCreate } from "../zod";
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
      columns: {
        with: {
          cards: {
            with: {
              assignedTo: {
                with: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  return board;
}

export const boardService = {
  create,
  list,
  get,
};
