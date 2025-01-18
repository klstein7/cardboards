import "server-only";

import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
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
import { z } from "zod";

import { db } from "../db";
import { cards, projectUsers, users } from "../db/schema";
import {
  type CardCreate,
  type CardCreateMany,
  type CardCreateManyPayload,
  CardGenerateResponseSchema,
  type CardMove,
  type CardSearchPayload,
  type CardUpdatePayload,
} from "../zod";
import { boardService } from "./board.service";
import { columnService } from "./column.service";

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

async function createMany(boardId: string, data: CardCreateManyPayload) {
  if (data.length === 0) return [];

  let columnId = data[0]!.columnId;

  if (!columnId) {
    const firstColumn = await columnService.getFirstColumnByBoardId(boardId);

    columnId = firstColumn.id;
  }

  const lastCardOrder = await getLastCardOrder(columnId);

  return db
    .insert(cards)
    .values(
      data.map((card, index) => ({
        ...card,
        columnId,
        order: lastCardOrder + index + 1,
        labels: card.labels.map((label) => label.text),
      })),
    )
    .returning();
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

async function generate(boardId: string, prompt: string) {
  const stream = createStreamableValue();

  const board = await boardService.getWithDetails(boardId);

  (async () => {
    const { partialObjectStream } = streamObject({
      model: google("gemini-2.0-flash-exp"),
      system: `
        You are an AI project management assistant specializing in Kanban methodology. 
        Generate cards that align with our system's structure and constraints:

        IMPORTANT: Avoid generating duplicate cards. Each card should be unique and distinct from existing cards on the board.

        Card Properties:
        - title: Required, max 255 characters, clear and actionable
        - description: Optional, max 1000 characters, with acceptance criteria. Must be in valid HTML format:
          * Use <p> for paragraphs
          * Use <ul>/<li> for lists
          * Use <strong> for bold text
          * Use <em> for italic text
          * Use <h1>, <h2>, <h3> for headings
          * Use <a href="..."> for links
          * No markdown syntax allowed
        - priority: Optional, one of ["low", "medium", "high", "urgent"]
        - dueDate: Optional, valid timestamp
        - labels: Optional array of text labels for categorization
        - order: Required, integer for card positioning
        - columnId: Required, must match an existing column

        Guidelines for Generation:
        1. Uniqueness:
           - Check existing board cards to avoid duplicates
           - Ensure each new card represents a distinct task or feature
           - If similar tasks exist, focus on different aspects or approaches

        2. Title Format:
           - Start with action verb
           - Be specific and measurable
           - Stay under 255 char limit

        3. Description Format:
           - Use proper HTML structure
           - Include clear acceptance criteria in lists
           - Add implementation details if relevant
           - Stay under 1000 char limit
           - Ensure all HTML tags are properly closed

        4. Priority Assignment:
           - urgent: Immediate attention required
           - high: Important for current sprint
           - medium: Standard priority
           - low: Nice to have

        5. Labels:
           - Use consistent terminology
           - Keep labels concise
           - Align with project context

        Board Context:
        - ${JSON.stringify(board)}

        Based on the provided board context and prompt, generate cards that follow these specifications while maintaining data integrity.
      `,
      prompt,
      schema: CardGenerateResponseSchema,
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })().catch(console.error);

  return { object: stream.value };
}

export const cardService = {
  create,
  createMany,
  list,
  move,
  get,
  update,
  generate,
};
