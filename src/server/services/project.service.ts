import "server-only";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import { boards, cards, columns, projects, projectUsers } from "../db/schema";
import { type ProjectCreate, type ProjectUpdatePayload } from "../zod";
import { BaseService } from "./base.service";
import { type HistoryService } from "./history.service";
import { type NotificationService } from "./notification.service";
import { type ProjectUserService } from "./project-user.service";
import { type UserService } from "./user.service";

// Define simpler type for selected member IDs
type MemberId = { userId: string };

/**
 * Service for managing project-related operations
 */
export class ProjectService extends BaseService {
  private readonly historyService: HistoryService;
  private readonly notificationService: NotificationService;
  private readonly projectUserService: ProjectUserService;
  private readonly userService: UserService;

  constructor(
    db: Database,
    historyService: HistoryService,
    notificationService: NotificationService,
    projectUserService: ProjectUserService,
    userService: UserService,
  ) {
    super(db);
    this.historyService = historyService;
    this.notificationService = notificationService;
    this.projectUserService = projectUserService;
    this.userService = userService;
  }

  /**
   * Create a new project
   */
  async create(data: ProjectCreate, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const { userId } = await auth();

      await this.userService.syncCurrentUser(txOrDb);

      const [project] = await txOrDb.insert(projects).values(data).returning();

      if (!project || !userId) {
        throw new Error("Failed to create project");
      }

      await this.projectUserService.create(
        {
          projectId: project.id,
          userId,
          role: "admin",
        },
        txOrDb,
      );

      await this.historyService.recordProjectAction(
        project.id,
        "create",
        undefined,
        txOrDb,
      );

      return project;
    }, tx ?? this.db);
  }

  /**
   * Update a project
   */
  async update(
    projectId: string,
    data: ProjectUpdatePayload,
    tx?: Transaction | Database,
  ) {
    return this.executeWithTx(async (txOrDb) => {
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

      const changes = JSON.stringify({
        before: existingProject,
        after: updated,
      });

      await this.historyService.recordProjectAction(
        projectId,
        "update",
        changes,
        txOrDb,
      );

      if (data.name && data.name !== existingProject.name) {
        const members = await txOrDb
          .select({ userId: projectUsers.userId })
          .from(projectUsers)
          .where(eq(projectUsers.projectId, projectId));

        const { userId: actorUserId } = await auth();

        const notificationsData = members
          .filter((member: MemberId) => member.userId !== actorUserId)
          .map((member: MemberId) => ({
            userId: member.userId,
            projectId,
            entityType: "project" as const,
            entityId: projectId,
            type: "project_update" as const,
            title: `Project "${existingProject.name}" renamed`,
            content: `The project "${existingProject.name}" was renamed to "${updated.name}".`,
          }));

        if (notificationsData.length > 0) {
          await this.notificationService.createMany(notificationsData, txOrDb);
        }
      }

      return updated;
    }, tx ?? this.db);
  }

  /**
   * List all projects
   */
  async list(tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const { userId } = await auth();

      if (!userId) {
        throw new Error("Unauthorized: User not authenticated");
      }

      const projects = await txOrDb.query.projects.findMany({
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

      const currentUserProjectRecords = await txOrDb
        .select()
        .from(projectUsers)
        .where(eq(projectUsers.userId, userId));

      return projects.map((project) => {
        const projectUser = currentUserProjectRecords.find(
          (pu) => pu.projectId === project.id,
        );

        return {
          ...project,
          isFavorite: projectUser?.isFavorite ?? false,
        };
      });
    }, tx ?? this.db);
  }

  /**
   * Get a project by ID
   */
  async get(projectId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const project = await txOrDb.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });

      if (!project) {
        throw new Error("Project not found");
      }

      return project;
    }, tx ?? this.db);
  }

  /**
   * Delete a project
   */
  async del(projectId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const project = await txOrDb.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });

      if (!project) {
        throw new Error("Project not found");
      }

      const members = await txOrDb
        .select({ userId: projectUsers.userId })
        .from(projectUsers)
        .where(eq(projectUsers.projectId, projectId));

      const notificationsData = members.map((member: MemberId) => ({
        userId: member.userId,
        projectId,
        entityType: "project" as const,
        entityId: projectId,
        type: "project_update" as const,
        title: `Project "${project.name}" is being deleted`,
        content: `The project "${project.name}" is scheduled for deletion.`,
      }));

      if (notificationsData.length > 0) {
        await this.notificationService.createMany(notificationsData, txOrDb);
      }

      await txOrDb.delete(projects).where(eq(projects.id, projectId));
    }, tx ?? this.db);
  }

  /**
   * Get project ID by card ID
   */
  async getProjectIdByCardId(cardId: number, tx?: Transaction | Database) {
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
    }, tx ?? this.db);
  }
}
