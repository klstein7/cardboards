import "server-only";

import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";

import { type Database, db, type Transaction } from "../db";
import {
  boards,
  cardComments,
  cards,
  columns,
  projects,
  projectUsers,
} from "../db/schema";
import { type CardCommentCreate, type CardCommentUpdatePayload } from "../zod";
import { BaseService } from "./base.service";

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

      return comment;
    }, tx);
  }

  /**
   * List comments for a card
   */
  async list(cardId: number, tx: Transaction | Database = this.db) {
    return this.executeWithTx(async (txOrDb) => {
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
      const [comment] = await txOrDb
        .delete(cardComments)
        .where(eq(cardComments.id, id))
        .returning();

      if (!comment) {
        throw new Error("Failed to delete card comment");
      }

      return comment;
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
      const [comment] = await txOrDb
        .update(cardComments)
        .set(data)
        .where(eq(cardComments.id, id))
        .returning();

      if (!comment) {
        throw new Error("Failed to update card comment");
      }

      return comment;
    }, tx);
  }
}

export const cardCommentService = new CardCommentService();
