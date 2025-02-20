import "server-only";

import { auth } from "@clerk/nextjs/server";
import { count, eq } from "drizzle-orm";

import { type Database, db, type Transaction } from "../db";
import { boards, cards, columns, projects } from "../db/schema";
import { type ProjectCreate } from "../zod";
import { projectUserService } from "./project-user.service";

async function create(data: ProjectCreate, tx: Transaction | Database = db) {
  const { userId } = await auth();

  const [project] = await tx.insert(projects).values(data).returning();

  if (!project || !userId) {
    throw new Error("Failed to create project");
  }

  await projectUserService.create(
    {
      projectId: project.id,
      userId,
      role: "admin",
    },
    tx,
  );

  return project;
}

async function list(tx: Transaction | Database = db) {
  return tx.query.projects.findMany({
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    with: {
      boards: true,
      projectUsers: true,
    },
  });
}

async function get(projectId: string, tx: Transaction | Database = db) {
  const project = await tx.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      boards: {
        with: {
          columns: true,
        },
      },
      projectUsers: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const [result] = await tx
    .select({ count: count() })
    .from(cards)
    .innerJoin(columns, eq(cards.columnId, columns.id))
    .innerJoin(boards, eq(columns.boardId, boards.id))
    .where(eq(boards.projectId, projectId));

  if (!result) {
    throw new Error("Failed to count cards");
  }

  const boardCounts = await tx
    .select({
      boardId: boards.id,
      count: count(),
    })
    .from(cards)
    .innerJoin(columns, eq(cards.columnId, columns.id))
    .innerJoin(boards, eq(columns.boardId, boards.id))
    .where(eq(boards.projectId, projectId))
    .groupBy(boards.id);

  const boardCountsMap = new Map(
    boardCounts.map((bc) => [bc.boardId, bc.count]),
  );

  const boardsWithCount = project.boards.map((board) => ({
    ...board,
    _count: {
      cards: boardCountsMap.get(board.id) ?? 0,
    },
  }));

  return {
    ...project,
    boards: boardsWithCount,
    _count: { cards: result.count },
  };
}

async function del(projectId: string, tx: Transaction | Database = db) {
  await tx.delete(projects).where(eq(projects.id, projectId));
}

async function getProjectIdByCardId(
  cardId: number,
  tx: Transaction | Database = db,
) {
  const [result] = await tx
    .select({
      projectId: boards.projectId,
    })
    .from(cards)
    .innerJoin(columns, eq(cards.columnId, columns.id))
    .innerJoin(boards, eq(columns.boardId, boards.id))
    .where(eq(cards.id, cardId));

  if (!result) {
    throw new Error("Project not found");
  }

  return result.projectId;
}

export const projectService = {
  create,
  list,
  get,
  del,
  getProjectIdByCardId,
};
