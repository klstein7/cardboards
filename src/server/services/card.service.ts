import "server-only";
import { db } from "../db";
import { type CardCreate } from "../zod";
import { cards } from "../db/schema";
import { asc, desc, eq } from "drizzle-orm";

async function getLastCardOrder(columnId: string) {
  const lastCard = await db.query.cards.findFirst({
    where: eq(cards.columnId, columnId),
    orderBy: desc(cards.order),
  });

  return lastCard?.order ?? 0;
}

async function create(data: CardCreate) {
  const lastCardOrder = await getLastCardOrder(data.columnId);

  const [card] = await db
    .insert(cards)
    .values({
      ...data,
      order: lastCardOrder + 1,
    })
    .returning();

  if (!card) {
    throw new Error("Failed to create card");
  }

  return card;
}

async function list(columnId: string) {
  return db.query.cards.findMany({
    where: eq(cards.columnId, columnId),
    orderBy: asc(cards.order),
  });
}

export const cardService = {
  create,
  list,
};
