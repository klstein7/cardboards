import "server-only";

import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";

import { type Database, type Transaction } from "../db";
import {
  boards,
  cardComments,
  cards,
  columns,
  projects,
  projectUsers,
} from "../db/schema";
import { type CardCommentCreate, type CardCommentUpdatePayload } from "../zod";
import { authService } from "./auth.service";
import { BaseService } from "./base.service";
import { historyService } from "./history.service";
import { projectService } from "./project.service";

/**
 * Service for managing card comments
 */
class CardCommentService extends BaseService {
  /**
   * Get a comment by ID
   */
  async get(id: string, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const [comment] = await txOrDb
        .select()
        .from(cardComments)
        .where(eq(cardComments.id, id));

      if (!comment) {
        throw new Error("Card comment not found");
      }

      // Check if the user can access the card this comment belongs to
      await authService.canAccessCard(comment.cardId, txOrDb);

      return comment;
    }, tx);
  }

  /**
   * Create a new card comment
   */
  async create(data: CardCommentCreate, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      // Check if the user can access the card
      await authService.canAccessCard(data.cardId, txOrDb);

      const { userId } = await auth();

      if (!userId) {
        throw new Error("User is not authenticated");
      }

      const [project] = await txOrDb
        .select({
          projectId: projects.id,
        })
        .from(projects)
        .innerJoin(boards, eq(boards.projectId, projects.id))
        .innerJoin(columns, eq(columns.boardId, boards.id))
        .innerJoin(cards, eq(cards.columnId, columns.id))
        .where(eq(cards.id, data.cardId));

      if (!project) {
        throw new Error("Project not found");
      }

      const { projectId } = project;

      const [projectUser] = await txOrDb
        .select({
          projectUserId: projectUsers.id,
        })
        .from(projectUsers)
        .where(
          and(
            eq(projectUsers.userId, userId),
            eq(projectUsers.projectId, projectId),
          ),
        );

      if (!projectUser) {
        throw new Error("User is not a member of the project");
      }

      const [comment] = await txOrDb
        .insert(cardComments)
        .values({
          ...data,
          projectUserId: projectUser.projectUserId,
        })
        .returning();

      if (!comment) {
        throw new Error("Failed to create card comment");
      }

      // Record history for card comment creation
      await historyService.create(
        {
          entityType: "card_comment",
          entityId: comment.id,
          action: "create",
          projectId,
        },
        txOrDb,
      );

      return comment;
    }, tx);
  }

  /**
   * List comments for a card
   */
  async list(cardId: number, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      // Check if the user can access the card
      await authService.canAccessCard(cardId, txOrDb);

      return txOrDb.query.cardComments.findMany({
        where: eq(cardComments.cardId, cardId),
        with: {
          projectUser: {
            with: {
              user: true,
            },
          },
        },
        orderBy: desc(cardComments.createdAt),
      });
    }, tx);
  }

  /**
   * Delete a comment
   */
  async remove(id: string, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const comment = await this.get(id, txOrDb);

      // Get the project ID from the card
      const projectId = await projectService.getProjectIdByCardId(
        comment.cardId,
        txOrDb,
      );

      // Check current user
      const { userId } = await auth();
      if (!userId) {
        throw new Error("User is not authenticated");
      }

      // Get the current user's project user record
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
        throw new Error("User is not a member of the project");
      }

      // Only allow admin or the comment creator to delete
      const isAdmin = projectUser.role === "admin";
      const isCreator = comment.projectUserId === projectUser.id;

      if (!isAdmin && !isCreator) {
        throw new Error(
          "Unauthorized: Only admins or the comment creator can delete comments",
        );
      }

      // Record changes for history
      const changes = JSON.stringify({
        before: comment,
        after: null,
      });

      const [deletedComment] = await txOrDb
        .delete(cardComments)
        .where(eq(cardComments.id, id))
        .returning();

      if (!deletedComment) {
        throw new Error("Failed to delete card comment");
      }

      // Record history for card comment deletion
      await historyService.create(
        {
          entityType: "card_comment",
          entityId: id,
          action: "delete",
          projectId,
          changes,
        },
        txOrDb,
      );

      return deletedComment;
    }, tx);
  }

  /**
   * Update a comment
   */
  async update(
    id: string,
    data: CardCommentUpdatePayload,
    tx: Transaction | Database = this.db,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const comment = await this.get(id, txOrDb);

      // Get the project ID from the card
      const projectId = await projectService.getProjectIdByCardId(
        comment.cardId,
        txOrDb,
      );

      // Check current user
      const { userId } = await auth();
      if (!userId) {
        throw new Error("User is not authenticated");
      }

      // Get the current user's project user record
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
        throw new Error("User is not a member of the project");
      }

      // Only allow admin or the comment creator to update
      const isAdmin = projectUser.role === "admin";
      const isCreator = comment.projectUserId === projectUser.id;

      if (!isAdmin && !isCreator) {
        throw new Error(
          "Unauthorized: Only admins or the comment creator can update comments",
        );
      }

      // Save original comment for history
      const originalComment = { ...comment };

      const [updatedComment] = await txOrDb
        .update(cardComments)
        .set(data)
        .where(eq(cardComments.id, id))
        .returning();

      if (!updatedComment) {
        throw new Error("Failed to update card comment");
      }

      // Record changes for history
      const changes = JSON.stringify({
        before: originalComment,
        after: updatedComment,
      });

      // Record history for card comment update
      await historyService.create(
        {
          entityType: "card_comment",
          entityId: id,
          action: "update",
          projectId,
          changes,
        },
        txOrDb,
      );

      return updatedComment;
    }, tx);
  }
}

export const cardCommentService = new CardCommentService();
