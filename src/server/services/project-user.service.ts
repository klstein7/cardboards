import "server-only";

import { auth } from "@clerk/nextjs/server";
import { and, count, eq } from "drizzle-orm";

import { type Database, db, type Transaction } from "../db";
import { projectUsers } from "../db/schema";
import { type ProjectUserCreate, type ProjectUserUpdatePayload } from "../zod";

async function list(projectId: string, tx: Transaction | Database = db) {
  return tx.query.projectUsers.findMany({
    where: eq(projectUsers.projectId, projectId),
    with: {
      user: true,
    },
  });
}

async function create(
  data: ProjectUserCreate,
  tx: Transaction | Database = db,
) {
  const [projectUser] = await tx
    .insert(projectUsers)
    .values(data)
    .onConflictDoUpdate({
      target: [projectUsers.projectId, projectUsers.userId],
      set: {
        role: data.role,
      },
    })
    .returning();

  if (!projectUser) {
    throw new Error("Failed to create project user");
  }

  return projectUser;
}

async function getByProjectIdAndUserId(
  projectId: string,
  userId: string,
  tx: Transaction | Database = db,
) {
  const projectUser = await tx.query.projectUsers.findFirst({
    where: and(
      eq(projectUsers.projectId, projectId),
      eq(projectUsers.userId, userId),
    ),
  });

  if (!projectUser) {
    throw new Error("Project user not found");
  }

  return projectUser;
}

async function update(
  projectId: string,
  userId: string,
  data: ProjectUserUpdatePayload,
  tx: Transaction | Database = db,
) {
  const [projectUser] = await tx
    .update(projectUsers)
    .set(data)
    .where(
      and(
        eq(projectUsers.projectId, projectId),
        eq(projectUsers.userId, userId),
      ),
    )
    .returning();

  if (!projectUser) {
    throw new Error("Failed to update project user");
  }

  return projectUser;
}

async function countByProjectId(
  projectId: string,
  tx: Transaction | Database = db,
) {
  const [result] = await tx
    .select({ count: count() })
    .from(projectUsers)
    .where(eq(projectUsers.projectId, projectId));

  return result?.count ?? 0;
}

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

export const projectUserService = {
  list,
  create,
  getByProjectIdAndUserId,
  update,
  countByProjectId,
  getCurrentProjectUser,
};
