import "server-only";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { type Database, db, type Transaction } from "../db";
import { projects } from "../db/schema";
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
      boards: true,
      projectUsers: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
}

async function del(projectId: string, tx: Transaction | Database = db) {
  await tx.delete(projects).where(eq(projects.id, projectId));
}

export const projectService = {
  create,
  list,
  get,
  del,
};
