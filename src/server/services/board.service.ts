import "server-only";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { count, eq } from "drizzle-orm";

import { type Color, COLORS } from "~/lib/utils";

import { type Database, db, type Transaction } from "../db";
import { boards } from "../db/schema";
import {
  type BoardCreate,
  BoardGenerateResponseSchema,
  type BoardUpdatePayload,
} from "../zod";
import { cardService } from "./card.service";
import { columnService } from "./column.service";
import { projectService } from "./project.service";

async function create(
  data: BoardCreate,
  customColumns?: { name: string; order: number; isCompleted: boolean }[],
  tx: Transaction | Database = db,
) {
  const colorKeys = Object.keys(COLORS) as Color[];
  let randomColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];

  if (!randomColorKey) {
    randomColorKey = "blue";
  }

  const randomColorHex = COLORS[randomColorKey];

  const [board] = await tx
    .insert(boards)
    .values({
      ...data,
      color: randomColorHex,
    })
    .returning();

  if (!board) {
    throw new Error("Failed to create board");
  }

  if (customColumns) {
    await columnService.createMany(
      customColumns.map((column) => ({
        boardId: board.id,
        ...column,
      })),
      tx,
    );
  } else {
    await columnService.createMany(
      [
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
          isCompleted: true,
        },
      ],
      tx,
    );
  }

  return board;
}

async function list(projectId: string, tx: Transaction | Database = db) {
  return tx.query.boards.findMany({
    where: eq(boards.projectId, projectId),
  });
}

async function get(boardId: string, tx: Transaction | Database = db) {
  const board = await tx.query.boards.findFirst({
    where: eq(boards.id, boardId),
    with: {
      columns: true,
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  return board;
}

async function getWithDetails(
  boardId: string,
  tx: Transaction | Database = db,
) {
  const board = await tx.query.boards.findFirst({
    where: eq(boards.id, boardId),
    with: {
      columns: {
        with: {
          cards: true,
        },
      },
    },
  });

  return board;
}

async function update(
  boardId: string,
  data: BoardUpdatePayload,
  tx: Transaction | Database = db,
) {
  const [board] = await tx
    .update(boards)
    .set(data)
    .where(eq(boards.id, boardId))
    .returning();

  if (!board) {
    throw new Error("Board not found");
  }

  return board;
}

async function del(boardId: string, tx: Transaction | Database = db) {
  const [board] = await tx
    .delete(boards)
    .where(eq(boards.id, boardId))
    .returning();

  if (!board) {
    throw new Error("Error deleting board");
  }

  return board;
}

async function generate(
  projectId: string,
  prompt: string,
  tx: Transaction | Database = db,
) {
  const project = await projectService.get(projectId, tx);

  const response = await generateObject({
    model: google("gemini-2.0-flash-exp"),
    prompt: `
      You are an AI project management assistant specializing in simple, minimal Kanban boards.
      Create a straightforward board that helps users start quickly and maintain focus.

      PROJECT CONTEXT:
      ${JSON.stringify(project)}

      USER REQUEST:
      ${prompt}

      CORE PRINCIPLES:
      1. Simplicity is key - use 3-5 columns
      2. Column names should reflect the project's context
      3. Make the workflow progression obvious
      4. Use language that resonates with the project domain

      WORKFLOW STRUCTURE:
      Create a flow with 3-5 columns. Examples:
      
      For expense tracking (4 columns):
        Columns: "To Claim" → "Preparing" → "In Review" → "Reimbursed"
        Starter cards: 
          - Title: "EXAMPLE: Office supplies from Staples"
            Description: "<p>Receipt for printer paper and ink cartridges - $127.50</p><ul><li>Receipt attached</li><li>Purchased on March 15</li><li>Department: Engineering</li></ul>"
            Priority: "medium"
            Labels: ["office-supplies", "q1-2024"]
          - Title: "EXAMPLE: Client lunch meeting at Cafe Luna"
            Description: "<p>Business lunch with client on March 15 - $45.80</p><ul><li>Attendees: 3</li><li>Client: Acme Corp</li><li>Receipt needed</li></ul>"
            Priority: "medium"
            Labels: ["meals", "client-meeting"]

      For recruitment (5 columns):
        Columns: "To Screen" → "Initial Call" → "Technical" → "Final Round" → "Hired"
        Starter cards:
          - Title: "EXAMPLE: Senior Developer application - Jane Smith"
            Description: "<p>Resume received on March 16</p><ul><li>5 years React experience</li><li>Currently at Tech Corp</li><li>Salary range: $120-150k</li></ul>"
            Priority: "high"
            Labels: ["engineering", "senior-level"]
          - Title: "EXAMPLE: Product Manager application - John Doe"
            Description: "<p>Internal referral from Marketing team</p><ul><li>3 years at Google</li><li>MBA from Stanford</li><li>Available in 2 months</li></ul>"
            Priority: "medium"
            Labels: ["product", "referral"]

      TECHNICAL REQUIREMENTS:
      1. Create 3-5 columns with contextual names
      2. Only the final column should have isCompleted: true
      3. First column only:
         - 2 starter tasks that:
         - Must prefix titles with "EXAMPLE: "
         - Include HTML-formatted descriptions with <p> and <ul>/<li> tags
         - Set appropriate priority ("low", "medium", "high", "urgent")
         - Add relevant context-specific labels
         - Match the board's specific purpose
      4. Column names should show clear progression
      5. Number of columns should make sense for the workflow
    `,
    schema: BoardGenerateResponseSchema,
  });

  return await tx.transaction(async (tx) => {
    const board = await create(
      {
        name: response.object.name,
        projectId,
      },
      response.object.columns,
      tx,
    );

    const columns = await columnService.list(board.id, tx);
    const firstColumn = columns[0];

    if (!firstColumn) {
      throw new Error("No columns created");
    }

    const firstColumnCards = response.object.columns[0]?.cards;
    if (firstColumnCards && firstColumnCards.length > 0) {
      await cardService.createMany(
        board.id,
        firstColumnCards.map((card) => ({
          title: card.title,
          description: card.description,
          columnId: firstColumn.id,
          labels: [],
          priority: "medium",
        })),
        tx,
      );
    }

    return board;
  });
}

async function countByProjectId(
  projectId: string,
  tx: Transaction | Database = db,
) {
  const [result] = await tx
    .select({ count: count() })
    .from(boards)
    .where(eq(boards.projectId, projectId));

  return result?.count ?? 0;
}

export const boardService = {
  create,
  list,
  get,
  getWithDetails,
  update,
  del,
  generate,
  countByProjectId,
};
