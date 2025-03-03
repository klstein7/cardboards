import "server-only";

import { auth } from "@clerk/nextjs/server";
import { and, count, eq } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { projectUsers } from "../db/schema";
import { type ProjectUserCreate, type ProjectUserUpdatePayload } from "../zod";
import { BaseService } from "./base.service";

/**
 * Service for managing project user operations
 */
class ProjectUserService extends BaseService {
  /**
   * List all users for a project
   */
  async list(projectId: string, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      return txOrDb.query.projectUsers.findMany({
        where: eq(projectUsers.projectId, projectId),
        with: {
          user: true,
        },
      });
    }, tx);
  }

  /**
   * Create a new project user
   */
  async create(data: ProjectUserCreate, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const [projectUser] = await txOrDb
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
    }, tx);
  }

  /**
   * Get project user by project ID and user ID
   */
  async getByProjectIdAndUserId(
    projectId: string,
    userId: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const projectUser = await txOrDb.query.projectUsers.findFirst({
        where: and(
          eq(projectUsers.projectId, projectId),
          eq(projectUsers.userId, userId),
        ),
      });

      if (!projectUser) {
        throw new Error("Project user not found");
      }

      return projectUser;
    }, tx);
  }

  /**
   * Update a project user
   */
  async update(
    projectId: string,
    userId: string,
    data: ProjectUserUpdatePayload,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const [projectUser] = await txOrDb
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
    }, tx);
  }

  /**
   * Count project users by project ID
   */
  async countByProjectId(
    projectId: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const [result] = await txOrDb
        .select({ count: count() })
        .from(projectUsers)
        .where(eq(projectUsers.projectId, projectId));

      return result?.count ?? 0;
    }, tx);
  }

  /**
   * Get the current user's project user record
   */
  async getCurrentProjectUser(
    projectId: string,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const { userId } = await auth();

      if (!userId) {
        throw new Error("Unauthorized: User not authenticated");
      }

      const projectUser = await txOrDb.query.projectUsers.findFirst({
        where: and(
          eq(projectUsers.projectId, projectId),
          eq(projectUsers.userId, userId),
        ),
      });

      if (!projectUser) {
        throw new Error("Unauthorized: User is not a member of this project");
      }

      return projectUser;
    }, tx);
  }
}

export const projectUserService = new ProjectUserService();
