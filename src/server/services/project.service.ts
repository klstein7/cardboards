import "server-only";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { boards, cards, columns, projects, projectUsers } from "../db/schema";
import { type ProjectCreate, type ProjectUpdatePayload } from "../zod";
import { BaseService } from "./base.service";
import { historyService } from "./history.service";
import { projectUserService } from "./project-user.service";
import { userService } from "./user.service";

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

      await userService.syncCurrentUser(txOrDb);

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

      await historyService.recordProjectAction(
        project.id,
        "create",
        undefined,
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
      // Get the project before update to track changes
      const existingProject = await txOrDb.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });

      if (!existingProject) {
        throw new Error("Project not found");
      }

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

      // Record changes
      const changes = JSON.stringify({
        before: existingProject,
        after: updated,
      });

      // Record history for project update
      await historyService.recordProjectAction(
        projectId,
        "update",
        changes,
        txOrDb,
      );

      return updated;
    }, tx);
  }

  /**
   * List all projects
   */
  async list(tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const { userId } = await auth();

      if (!userId) {
        throw new Error("Unauthorized: User not authenticated");
      }

      return txOrDb.query.projects.findMany({
        where: (projects, { exists, eq, and }) =>
          exists(
            txOrDb
              .select()
              .from(projectUsers)
              .where(
                and(
                  eq(projectUsers.projectId, projects.id),
                  eq(projectUsers.userId, userId),
                ),
              ),
          ),
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
      // Get the project before deletion to record in history
      const project = await txOrDb.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });

      if (!project) {
        throw new Error("Project not found");
      }

      // Record the project data before deletion
      const changes = JSON.stringify({
        before: project,
        after: null,
      });

      // Delete the project
      await txOrDb.delete(projects).where(eq(projects.id, projectId));

      // Record history for project deletion
      // Note: This needs to happen outside the transaction since we've deleted the project
      // We'll create this record in a separate transaction
      await historyService.recordProjectAction(projectId, "delete", changes);
    }, tx);
  }

  /**
   * Get project ID by card ID
   */
  async getProjectIdByCardId(
    cardId: number,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const [result] = await txOrDb
        .select({
          projectId: boards.projectId,
        })
        .from(cards)
        .innerJoin(columns, eq(cards.columnId, columns.id))
        .innerJoin(boards, eq(columns.boardId, boards.id))
        .where(eq(cards.id, cardId));

      if (!result) {
        throw new Error("Project not found for card");
      }

      return result.projectId;
    }, tx);
  }
}

export const projectService = new ProjectService();
