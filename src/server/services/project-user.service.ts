import "server-only";

import { eq } from "drizzle-orm";

import { type Database, db, type Transaction } from "../db";
import { projectUsers } from "../db/schema";
import { type ProjectUserCreate } from "../zod";

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
  const [projectUser] = await tx.insert(projectUsers).values(data).returning();

  if (!projectUser) {
    throw new Error("Failed to create project user");
  }

  return projectUser;
}

export const projectUserService = {
  list,
  create,
};
