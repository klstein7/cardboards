import "server-only";

import { auth } from "@clerk/nextjs/server";

import { db } from "../db";
import { projects } from "../db/schema";
import { type ProjectCreate } from "../zod";
import { projectUserService } from "./project-user.service";

async function create(data: ProjectCreate) {
  const { userId } = await auth();

  const [project] = await db.insert(projects).values(data).returning();

  if (!project || !userId) {
    throw new Error("Failed to create project");
  }

  await projectUserService.create({
    projectId: project.id,
    userId,
    role: "admin",
  });

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
