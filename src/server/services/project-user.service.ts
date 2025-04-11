import "server-only";

import { auth } from "@clerk/nextjs/server";
import { and, count, eq } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { projects, projectUsers } from "../db/schema";
import { type ProjectUserCreate, type ProjectUserUpdatePayload } from "../zod";
import { BaseService } from "./base.service";
import { type NotificationService } from "./notification.service";

/**
 * Update current user preferences data shape
 */
export interface ProjectUserPreferencesUpdate {
  isFavorite?: boolean;
}

/**
 * Service for managing project users
 */
export class ProjectUserService extends BaseService {
  private readonly notificationService: NotificationService;

  constructor(db: Database, notificationService: NotificationService) {
    super(db);
    this.notificationService = notificationService;
  }

  /**
   * List all users for a project
   */
  async list(projectId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      return txOrDb.query.projectUsers.findMany({
        where: eq(projectUsers.projectId, projectId),
        with: {
          user: true,
        },
      });
    }, tx ?? this.db);
  }

  /**
   * Create a new project user
   */
  async create(data: ProjectUserCreate, tx?: Transaction | Database) {
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

      // Get project and user names for notification
      const [project] = await txOrDb
        .select({
          name: projects.name,
        })
        .from(projects)
        .where(eq(projects.id, data.projectId));

      // Create notification for the user
      await this.notificationService.create(
        {
          userId: data.userId,
          projectId: data.projectId,
          entityType: "project",
          entityId: data.projectId,
          type: "project_update",
          title: `You were added to project "${project?.name ?? "Untitled"}"`,
          content: `You have been added to the project "${project?.name ?? "Untitled"}" as a ${data.role}.`,
        },
        txOrDb,
      );

      return projectUser;
    }, tx ?? this.db);
  }

  /**
   * Get project user by project ID and user ID
   */
  async getByProjectIdAndUserId(
    projectId: string,
    userId: string,
    tx?: Transaction | Database,
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
    }, tx ?? this.db);
  }

  /**
   * Update a project user
   */
  async update(
    projectId: string,
    userId: string,
    data: ProjectUserUpdatePayload,
    tx?: Transaction | Database,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      // Don't allow removing the last admin
      if (data.role === "member") {
        const [projectUser] = await txOrDb
          .select()
          .from(projectUsers)
          .where(
            and(
              eq(projectUsers.projectId, projectId),
              eq(projectUsers.userId, userId),
            ),
          );

        if (projectUser && projectUser.role === "admin") {
          // Check if this is the last admin
          const result = await txOrDb
            .select({
              adminCount: count(),
            })
            .from(projectUsers)
            .where(
              and(
                eq(projectUsers.projectId, projectId),
                eq(projectUsers.role, "admin"),
              ),
            );

          const adminCount = result[0]?.adminCount ?? 0;

          if (adminCount <= 1) {
            throw new Error(
              "Cannot remove the last admin from the project. Promote another user to admin first.",
            );
          }
        }
      }

      const [projectUserResult] = await txOrDb
        .update(projectUsers)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(projectUsers.projectId, projectId),
            eq(projectUsers.userId, userId),
          ),
        )
        .returning();

      if (!projectUserResult) {
        throw new Error("Project user not found");
      }

      return projectUserResult;
    }, tx ?? this.db);
  }

  /**
   * Remove a user from a project
   */
  async remove(projectId: string, userId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const [projectUser] = await txOrDb
        .select()
        .from(projectUsers)
        .where(
          and(
            eq(projectUsers.projectId, projectId),
            eq(projectUsers.userId, userId),
          ),
        );

      if (!projectUser) {
        throw new Error("Project user not found");
      }

      if (projectUser.role === "admin") {
        // Check if this is the last admin
        const result = await txOrDb
          .select({
            adminCount: count(),
          })
          .from(projectUsers)
          .where(
            and(
              eq(projectUsers.projectId, projectId),
              eq(projectUsers.role, "admin"),
            ),
          );

        const adminCount = result[0]?.adminCount ?? 0;

        if (adminCount <= 1) {
          throw new Error(
            "Cannot remove the last admin from the project. Promote another user to admin first.",
          );
        }
      }

      await txOrDb
        .delete(projectUsers)
        .where(
          and(
            eq(projectUsers.projectId, projectId),
            eq(projectUsers.userId, userId),
          ),
        );
    }, tx ?? this.db);
  }

  /**
   * Count users by project ID
   */
  async countByProjectId(projectId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const [result] = await txOrDb
        .select({ count: count() })
        .from(projectUsers)
        .where(eq(projectUsers.projectId, projectId));

      return result?.count ?? 0;
    }, tx ?? this.db);
  }

  /**
   * Get the current user's project user record
   */
  async getCurrentProjectUser(projectId: string, tx?: Transaction | Database) {
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
    }, tx ?? this.db);
  }

  /**
   * Update the current user's preferences for a project
   */
  async updateCurrentUserPreferences(
    projectId: string,
    data: ProjectUserPreferencesUpdate,
    tx?: Transaction | Database,
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

      // Update the project user preferences
      const [updatedProjectUser] = await txOrDb
        .update(projectUsers)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(projectUsers.projectId, projectId),
            eq(projectUsers.userId, userId),
          ),
        )
        .returning();

      if (!updatedProjectUser) {
        throw new Error("Failed to update project user preferences");
      }

      return updatedProjectUser;
    }, tx ?? this.db);
  }
}
