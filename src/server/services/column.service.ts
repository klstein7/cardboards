import "server-only";

import { asc, eq } from "drizzle-orm";

import { type Database, db, type Transaction } from "../db";
import { columns } from "../db/schema";
import { type ColumnCreate } from "../zod";

async function createMany(
  data: ColumnCreate[],
  tx: Transaction | Database = db,
) {
  await tx.insert(columns).values(data);
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

export const columnService = {
  createMany,
  list,
  getFirstColumnByBoardId,
};
