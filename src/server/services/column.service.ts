import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "../db";
import { columns } from "../db/schema";
import { type ColumnCreate } from "../zod";

async function createMany(data: ColumnCreate[]) {
  await db.insert(columns).values(data);
}

async function list(boardId: string) {
  return db.query.columns.findMany({
    where: eq(columns.boardId, boardId),
    orderBy: asc(columns.order),
  });
}

async function getFirstColumnByBoardId(boardId: string) {
  const columns = await list(boardId);

  if (columns.length === 0) {
    throw new Error("No columns found");
  }

  return columns[0]!;
}

export const columnService = {
  createMany,
  list,
  getFirstColumnByBoardId,
};
