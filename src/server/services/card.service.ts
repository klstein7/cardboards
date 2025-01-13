import "server-only";

import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  lt,
  lte,
  sql,
} from "drizzle-orm";

import { db } from "../db";
import { cards, projectUsers, users } from "../db/schema";
import {
  type CardCreate,
  type CardMove,
  type CardSearchPayload,
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

async function list(columnId: string, searchPayload?: CardSearchPayload) {
  if (!searchPayload?.search) {
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

  const searchQuery = searchPayload.search
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => `${word}:*`)
    .join(" & ");

  if (!searchQuery) {
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

  try {
    const results = await db
      .select({
        ...getTableColumns(cards),
        userId: users.id,
        name: users.name,
        email: users.email,
        imageUrl: users.imageUrl,
        searchRank: sql`ts_rank(
          setweight(to_tsvector('simple', lower(${cards.title})), 'A') ||
          setweight(to_tsvector('simple', COALESCE(lower(${cards.description}), '')), 'B') ||
          setweight(to_tsvector('simple', COALESCE(array_to_string(${cards.labels}, ' '), '')), 'C') ||
          setweight(to_tsvector('simple', COALESCE((
            SELECT string_agg(lower(content), ' ') 
            FROM kanban_card_comment 
            WHERE card_id = ${cards.id}
          ), '')), 'D'),
          to_tsquery('simple', ${searchQuery})
        )`,
      })
      .from(cards)
      .leftJoin(projectUsers, eq(cards.assignedToId, projectUsers.id))
      .leftJoin(users, eq(projectUsers.userId, users.id))
      .where(
        and(
          eq(cards.columnId, columnId),
          sql`(
            setweight(to_tsvector('simple', lower(${cards.title})), 'A') ||
            setweight(to_tsvector('simple', COALESCE(lower(${cards.description}), '')), 'B') ||
            setweight(to_tsvector('simple', COALESCE(array_to_string(${cards.labels}, ' '), '')), 'C') ||
            setweight(to_tsvector('simple', COALESCE((
              SELECT string_agg(lower(content), ' ') 
              FROM kanban_card_comment 
              WHERE card_id = ${cards.id}
            ), '')), 'D')
          ) @@ to_tsquery('simple', ${searchQuery})`,
        ),
      )
      .orderBy(
        desc(
          sql`ts_rank(
            setweight(to_tsvector('simple', lower(${cards.title})), 'A') ||
            setweight(to_tsvector('simple', COALESCE(lower(${cards.description}), '')), 'B') ||
            setweight(to_tsvector('simple', COALESCE(array_to_string(${cards.labels}, ' '), '')), 'C') ||
            setweight(to_tsvector('simple', COALESCE((
              SELECT string_agg(lower(content), ' ') 
              FROM kanban_card_comment 
              WHERE card_id = ${cards.id}
            ), '')), 'D'),
            to_tsquery('simple', ${searchQuery})
          )`,
        ),
        asc(cards.order),
      );

    return results.map(
      ({ searchRank, userId, name, email, imageUrl, ...cardFields }) => ({
        ...cardFields,
        assignedTo: cardFields.assignedToId
          ? {
              user: {
                id: userId,
                name,
                email,
                imageUrl,
              },
            }
          : null,
      }),
    );
  } catch (error) {
    console.error("Error in search query:", error);
    return [];
  }
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
