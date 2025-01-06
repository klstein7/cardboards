import "server-only";
import { type ProjectCreate } from "../zod";
import { db } from "../db";
import { projects } from "../db/schema";

async function create(data: ProjectCreate) {
  const [project] = await db.insert(projects).values(data).returning();

  if (!project) {
    throw new Error("Failed to create project");
  }

  return project;
}

async function list() {
  return db.query.projects.findMany({
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
  });
}

export const projectService = {
  create,
  list,
};
