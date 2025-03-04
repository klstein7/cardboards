import "server-only";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { boards, cards, columns, projects } from "../db/schema";
import { type ProjectCreate, type ProjectUpdatePayload } from "../zod";
import { authService } from "./auth.service";
import { BaseService } from "./base.service";
import { projectUserService } from "./project-user.service";

/**
 * Service for managing project-related operations
 */
class ProjectService extends BaseService {
  /**
   * Create a new project
   */
  async create(data: ProjectCreate, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const { userId } = await auth();

      const [project] = await txOrDb.insert(projects).values(data).returning();

      if (!project || !userId) {
        throw new Error("Failed to create project");
      }

      await projectUserService.create(
        {
          projectId: project.id,
          userId,
          role: "admin",
        },
        txOrDb,
      );

      return project;
    }, tx);
  }

  /**
   * Update a project
   */
  async update(
    projectId: string,
    data: ProjectUpdatePayload,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      // Verify admin access
      await authService.requireProjectAdmin(projectId, txOrDb);

      const [updated] = await txOrDb
        .update(projects)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, projectId))
        .returning();

      if (!updated) {
        throw new Error("Failed to update project");
      }

      return updated;
    }, tx);
  }

  /**
   * List all projects
   */
  async list(tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      return txOrDb.query.projects.findMany({
        orderBy: (projects, { desc }) => [desc(projects.createdAt)],
        with: {
          boards: true,
          projectUsers: true,
        },
      });
    }, tx);
  }

  /**
   * Get a project by ID
   */
  async get(projectId: string, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      // Verify user can access this project
      await authService.canAccessProject(projectId, txOrDb);

      const project = await txOrDb.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });

      if (!project) {
        throw new Error("Project not found");
      }

      return project;
    }, tx);
  }

  /**
   * Delete a project
   */
  async del(projectId: string, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      // Verify admin access
      await authService.requireProjectAdmin(projectId, txOrDb);

      await txOrDb.delete(projects).where(eq(projects.id, projectId));
    }, tx);
  }

  /**
   * Get a project ID from a card ID
   */
  async getProjectIdByCardId(
    cardId: number,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      // Verify user can access this card
      await authService.canAccessCard(cardId, txOrDb);

      const [result] = await txOrDb
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
    }, tx);
  }
}

export const projectService = new ProjectService();
