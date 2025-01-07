import "server-only";
import { db } from "../db";
import { type CardMove, type CardCreate } from "../zod";
import { cards } from "../db/schema";
import { asc, desc, eq, and, gt, gte, lt, lte, sql } from "drizzle-orm";

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

async function move(data: CardMove) {
  const { cardId, destinationColumnId, newOrder } = data;

  const card = await db.query.cards.findFirst({
    where: eq(cards.id, data.cardId),
  });

  if (!card) {
    throw new Error("Card not found");
  }

  const isNewColumn = card.columnId !== destinationColumnId;

  return await db.transaction(async (tx) => {
    if (isNewColumn) {
      await tx
        .update(cards)
        .set({ order: sql`${cards.order} + 1` })
        .where(
          and(
            eq(cards.columnId, destinationColumnId),
            gte(cards.order, newOrder),
          ),
        );

      await tx
        .update(cards)
        .set({ order: sql`${cards.order} - 1` })
        .where(
          and(eq(cards.columnId, card.columnId), gt(cards.order, card.order)),
        );
    } else {
      if (newOrder > card.order) {
        await tx
          .update(cards)
          .set({ order: sql`${cards.order} - 1` })
          .where(
            and(
              eq(cards.columnId, card.columnId),
              gt(cards.order, card.order),
              lte(cards.order, newOrder),
            ),
          );
      } else {
        await tx
          .update(cards)
          .set({ order: sql`${cards.order} + 1` })
          .where(
            and(
              eq(cards.columnId, card.columnId),
              gte(cards.order, newOrder),
              lt(cards.order, card.order),
            ),
          );
      }
    }

    const [updatedCard] = await tx
      .update(cards)
      .set({
        order: newOrder,
        columnId: destinationColumnId,
      })
      .where(eq(cards.id, cardId))
      .returning();

    if (!updatedCard) {
      throw new Error("Failed to update card");
    }

    return {
      cardId,
      previousColumnId: card.columnId,
      newColumnId: updatedCard.columnId,
    };
  });
}

export const cardService = {
  create,
  list,
  move,
};
