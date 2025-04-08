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
  users,
} from "../db/schema";
import { type CardCommentCreate, type CardCommentUpdatePayload } from "../zod";
import { BaseService } from "./base.service";
import { historyService } from "./history.service";
import { notificationService } from "./notification.service";
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

      return comment;
    }, tx);
  }

  /**
   * Create a new card comment
   */
  async create(data: CardCommentCreate, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      const { userId } = await auth();

      if (!userId) {
        throw new Error("User is not authenticated");
      }

      // Get the card details
      const [cardDetails] = await txOrDb
        .select({
          title: cards.title,
          assignedToId: cards.assignedToId,
          card: cards,
          projectId: projects.id,
          columnName: columns.name,
        })
        .from(cards)
        .innerJoin(columns, eq(columns.id, cards.columnId))
        .innerJoin(boards, eq(boards.id, columns.boardId))
        .innerJoin(projects, eq(projects.id, boards.projectId))
        .where(eq(cards.id, data.cardId));

      if (!cardDetails) {
        throw new Error("Card not found");
      }

      const { projectId } = cardDetails;

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
        throw new Error("Failed to create comment");
      }

      // Get commenter's name
      const [commenter] = await txOrDb
        .select({
          userName: users.name,
        })
        .from(projectUsers)
        .innerJoin(users, eq(users.id, projectUsers.userId))
        .where(eq(projectUsers.id, projectUser.projectUserId));

      const commenterName = commenter?.userName ?? "A user";

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

      // If card is assigned to someone else, create notification for assigned user
      if (
        cardDetails.assignedToId &&
        cardDetails.assignedToId !== projectUser.projectUserId
      ) {
        // Get assigned user's ID
        const [assignedProjectUser] = await txOrDb
          .select({
            userId: projectUsers.userId,
          })
          .from(projectUsers)
          .where(eq(projectUsers.id, cardDetails.assignedToId));

        if (assignedProjectUser) {
          await notificationService.create(
            {
              userId: assignedProjectUser.userId,
              projectId,
              entityType: "card_comment",
              entityId: comment.id,
              type: "comment",
              title: `New comment on "${cardDetails.title}"`,
              content: `${commenterName} commented on a card assigned to you: "${cardDetails.title}" in column "${cardDetails.columnName}"`,
            },
            txOrDb,
          );
        }
      }

      return comment;
    }, tx);
  }

  /**
   * List all comments for a card
   */
  async list(cardId: number, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
      return txOrDb.query.cardComments.findMany({
        where: eq(cardComments.cardId, cardId),
        orderBy: desc(cardComments.createdAt),
        with: {
          projectUser: {
            with: {
              user: true,
            },
          },
        },
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

      // Record changes for history
      const changes = JSON.stringify({
        before: comment,
        after: { ...comment, ...data },
      });

      const [updatedComment] = await txOrDb
        .update(cardComments)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(cardComments.id, id))
        .returning();

      if (!updatedComment) {
        throw new Error("Failed to update card comment");
      }

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
