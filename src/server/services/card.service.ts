import "server-only";

import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { and, asc, desc, eq, gt, gte, lt, lte, sql } from "drizzle-orm";

import { type Database, db, type Transaction } from "../db";
import { cards } from "../db/schema";
import {
  type CardCreate,
  type CardCreateManyPayload,
  CardGenerateResponseSchema,
  type CardMove,
  type CardUpdatePayload,
} from "../zod";
import { boardService } from "./board.service";
import { columnService } from "./column.service";
import { projectService } from "./project.service";
import { projectUserService } from "./project-user.service";

async function getLastCardOrder(
  columnId: string,
  tx: Transaction | Database = db,
) {
  const lastCard = await tx.query.cards.findFirst({
    where: eq(cards.columnId, columnId),
    orderBy: desc(cards.order),
  });

  return lastCard?.order ?? -1;
}

async function create(data: CardCreate, tx: Transaction | Database = db) {
  const lastCardOrder = await getLastCardOrder(data.columnId, tx);

  const [card] = await tx
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

async function createMany(
  boardId: string,
  data: CardCreateManyPayload,
  tx: Transaction | Database = db,
) {
  if (data.length === 0) return [];

  let columnId = data[0]!.columnId;

  if (!columnId) {
    const firstColumn = await columnService.getFirstColumnByBoardId(boardId);
    columnId = firstColumn.id;
  }

  const lastCardOrder = await getLastCardOrder(columnId, tx);
  const startOrder = lastCardOrder === -1 ? 0 : lastCardOrder + 1;

  return tx
    .insert(cards)
    .values(
      data.map((card, index) => ({
        ...card,
        columnId,
        order: startOrder + index,
        labels: card.labels.map((label) => label.text),
      })),
    )
    .returning();
}

async function list(columnId: string, tx: Transaction | Database = db) {
  return tx.query.cards.findMany({
    where: eq(cards.columnId, columnId),
    orderBy: asc(cards.order),
    with: {
      assignedTo: {
        with: {
          user: true,
        },
      },
    },
  });
}

async function normalizeColumnOrders(
  columnId: string,
  tx: Transaction | Database = db,
) {
  const columnCards = await tx.query.cards.findMany({
    where: eq(cards.columnId, columnId),
    orderBy: asc(cards.order),
  });
  await Promise.all(
    columnCards.map((card, index) =>
      tx.update(cards).set({ order: index }).where(eq(cards.id, card.id)),
    ),
  );
}

async function move(data: CardMove, tx: Transaction | Database = db) {
  const { cardId, destinationColumnId, newOrder } = data;

  const card = await db.query.cards.findFirst({
    where: eq(cards.id, data.cardId),
  });

  if (!card) {
    throw new Error("Card not found");
  }

  const isNewColumn = card.columnId !== destinationColumnId;

  return await tx.transaction(async (tx) => {
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

    await normalizeColumnOrders(destinationColumnId, tx);
    if (isNewColumn) {
      await normalizeColumnOrders(card.columnId, tx);
    }

    return {
      cardId,
      previousColumnId: card.columnId,
      newColumnId: updatedCard.columnId,
    };
  });
}

async function get(cardId: number, tx: Transaction | Database = db) {
  const card = await tx.query.cards.findFirst({
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

async function update(
  cardId: number,
  data: CardUpdatePayload,
  tx: Transaction | Database = db,
) {
  const [card] = await tx
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
           - Start with an action verb
           - Be specific and measurable
           - Stay under 255 character limit

        3. Description Format:
           - Use proper HTML structure
           - Include clear acceptance criteria in lists
           - Add implementation details if relevant
           - Stay under 1000 character limit
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

        6. Maximum Cards:
           - Generate no more than 10 cards.

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

async function del(cardId: number, tx: Transaction | Database = db) {
  const [card] = await tx.delete(cards).where(eq(cards.id, cardId)).returning();

  if (!card) {
    throw new Error("Error deleting card");
  }

  return card;
}

async function assignToCurrentUser(
  cardId: number,
  tx: Transaction | Database = db,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not found");
  }

  const projectId = await projectService.getProjectIdByCardId(cardId, tx);
  const projectUser = await projectUserService.getByProjectIdAndUserId(
    projectId,
    userId,
    tx,
  );

  const card = await get(cardId, tx);

  const [updated] = await tx
    .update(cards)
    .set({
      assignedToId:
        card.assignedToId === projectUser.id ? null : projectUser.id,
    })
    .where(eq(cards.id, cardId))
    .returning();

  if (!updated) {
    throw new Error("Card not found");
  }

  return updated;
}

export const cardService = {
  create,
  createMany,
  list,
  move,
  get,
  update,
  generate,
  del,
  assignToCurrentUser,
};
