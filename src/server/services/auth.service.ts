import "server-only";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import { type Database, db, type Transaction } from "../db";
import { boards, cards, columns, projectUsers } from "../db/schema";

async function getCurrentProjectUser(
  projectId: string,
  tx: Transaction | Database = db,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: User not authenticated");
  }

  const projectUser = await tx.query.projectUsers.findFirst({
    where: and(
      eq(projectUsers.projectId, projectId),
      eq(projectUsers.userId, userId),
    ),
  });

  if (!projectUser) {
    throw new Error("Unauthorized: User is not a member of this project");
  }

  return projectUser;
}

async function requireProjectAdmin(
  projectId: string,
  tx: Transaction | Database = db,
) {
  const projectUser = await getCurrentProjectUser(projectId, tx);

  console.log("projectUser", projectUser);

  if (projectUser.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return projectUser;
}

async function canAccessBoard(
  boardId: string,
  tx: Transaction | Database = db,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: User not authenticated");
  }

  const [result] = await tx
    .select({
      projectUser: projectUsers,
    })
    .from(boards)
    .innerJoin(projectUsers, eq(boards.projectId, projectUsers.projectId))
    .where(and(eq(boards.id, boardId), eq(projectUsers.userId, userId)));

  if (!result) {
    throw new Error("Unauthorized: Cannot access this board");
  }

  return result.projectUser;
}

async function canAccessCard(cardId: number, tx: Transaction | Database = db) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: User not authenticated");
  }

  const [result] = await tx
    .select({
      projectUser: projectUsers,
    })
    .from(cards)
    .innerJoin(columns, eq(cards.columnId, columns.id))
    .innerJoin(boards, eq(columns.boardId, boards.id))
    .innerJoin(projectUsers, eq(boards.projectId, projectUsers.projectId))
    .where(and(eq(cards.id, cardId), eq(projectUsers.userId, userId)));

  if (!result) {
    throw new Error("Unauthorized: Cannot access this card");
  }

  return result.projectUser;
}

async function canAccessColumn(
  columnId: string,
  tx: Transaction | Database = db,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: User not authenticated");
  }

  const [result] = await tx
    .select({
      projectUser: projectUsers,
    })
    .from(columns)
    .innerJoin(boards, eq(columns.boardId, boards.id))
    .innerJoin(projectUsers, eq(boards.projectId, projectUsers.projectId))
    .where(and(eq(columns.id, columnId), eq(projectUsers.userId, userId)));

  if (!result) {
    throw new Error("Unauthorized: Cannot access this column");
  }

  return result.projectUser;
}

async function canAccessProject(
  projectId: string,
  tx: Transaction | Database = db,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: User not authenticated");
  }

  const projectUser = await tx.query.projectUsers.findFirst({
    where: and(
      eq(projectUsers.projectId, projectId),
      eq(projectUsers.userId, userId),
    ),
  });

  if (!projectUser) {
    throw new Error("Unauthorized: Cannot access this project");
  }

  return projectUser;
}

export const authService = {
  getCurrentProjectUser,
  requireProjectAdmin,
  canAccessBoard,
  canAccessCard,
  canAccessColumn,
  canAccessProject,
};
