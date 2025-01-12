import "server-only";

import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "../db";
import {
  boards,
  cardComments,
  cards,
  columns,
  projects,
  projectUsers,
} from "../db/schema";
import { type CardCommentCreate, type CardCommentUpdatePayload } from "../zod";

async function create(data: CardCommentCreate) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User is not authenticated");
  }

  const [project] = await db
    .select({
      projectId: projects.id,
    })
    .from(projects)
    .innerJoin(boards, eq(boards.projectId, projects.id))
    .innerJoin(columns, eq(columns.boardId, boards.id))
    .innerJoin(cards, eq(cards.columnId, columns.id))
    .where(eq(cards.id, data.cardId));

  if (!project) {
    throw new Error("Project not found");
  }

  const { projectId } = project;

  const [projectUser] = await db
    .select({
      projectUserId: projectUsers.id,
    })
    .from(projectUsers)
    .where(
      and(
        eq(projectUsers.userId, userId),
        eq(projectUsers.projectId, projectId),
      ),
    );

  if (!projectUser) {
    throw new Error("User is not a member of the project");
  }

  const [comment] = await db
    .insert(cardComments)
    .values({
      ...data,
      projectUserId: projectUser.projectUserId,
    })
    .returning();

  if (!comment) {
    throw new Error("Failed to create card comment");
  }

  return comment;
}

async function list(cardId: number) {
  return db.query.cardComments.findMany({
    where: eq(cardComments.cardId, cardId),
    with: {
      projectUser: {
        with: {
          user: true,
        },
      },
    },
    orderBy: desc(cardComments.createdAt),
  });
}

async function remove(id: string) {
  const [comment] = await db
    .delete(cardComments)
    .where(eq(cardComments.id, id))
    .returning();

  if (!comment) {
    throw new Error("Failed to delete card comment");
  }

  return comment;
}

async function update(id: string, data: CardCommentUpdatePayload) {
  const [comment] = await db
    .update(cardComments)
    .set(data)
    .where(eq(cardComments.id, id))
    .returning();

  if (!comment) {
    throw new Error("Failed to update card comment");
  }

  return comment;
}

export const cardCommentService = {
  create,
  list,
  remove,
  update,
};
