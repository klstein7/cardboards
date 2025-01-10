import "server-only";

import { eq } from "drizzle-orm";

import { db } from "../db";
import { projectUsers } from "../db/schema";
import { type ProjectUserCreate } from "../zod";

async function list(projectId: string) {
  return db.query.projectUsers.findMany({
    where: eq(projectUsers.projectId, projectId),
    with: {
      user: true,
    },
  });
}

async function create(data: ProjectUserCreate) {
  const [projectUser] = await db.insert(projectUsers).values(data).returning();

  if (!projectUser) {
    throw new Error("Failed to create project user");
  }

  return projectUser;
}

export const projectUserService = {
  list,
  create,
};
