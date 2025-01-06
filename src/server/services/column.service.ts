import "server-only";
import { type ColumnCreate } from "../zod";
import { db } from "../db";
import { columns } from "../db/schema";
import { eq } from "drizzle-orm";

async function createMany(data: ColumnCreate[]) {
  await db.insert(columns).values(data);
}

async function list(boardId: string) {
  return db.query.columns.findMany({
    where: eq(columns.boardId, boardId),
  });
}

export const columnService = {
  createMany,
  list,
};
