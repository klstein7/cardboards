import "server-only";

import { and, asc, desc, eq, gt, gte, lt, lte, sql } from "drizzle-orm";

import { db } from "../db";
import { cards } from "../db/schema";
import {
  type CardCreate,
  type CardMove,
  type CardUpdate,
  type CardUpdatePayload,
} from "../zod";

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
      labels: data.labels.map((label) => label.text),
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
    with: {
      assignedTo: {
        with: {
          user: true,
        },
      },
    },
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

async function get(cardId: number) {
  const card = await db.query.cards.findFirst({
    where: eq(cards.id, cardId),
    with: {
      column: {
        with: {
          board: true,
        },
      },
      assignedTo: {
        with: {
          user: true,
        },
      },
    },
  });

  if (!card) {
    throw new Error("Card not found");
  }

  return card;
}

async function update(cardId: number, data: CardUpdatePayload) {
  const [card] = await db
    .update(cards)
    .set(data)
    .where(eq(cards.id, cardId))
    .returning();

  if (!card) {
    throw new Error("Card not found");
  }

  return card;
}

export const cardService = {
  create,
  list,
  move,
  get,
  update,
};
