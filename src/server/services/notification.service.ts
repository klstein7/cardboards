import "server-only";

import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, sql } from "drizzle-orm";

import { pusherChannels } from "~/pusher/channels";
import { pusher } from "~/pusher/server";

import { type Database, type Transaction } from "../db";
import { notifications } from "../db/schema";
import {
  type NotificationCreate,
  type NotificationFilter,
  type NotificationUpdatePayload,
} from "../zod/schemas";
import { BaseService } from "./base.service";

/**
 * Service for managing notification operations
 */
export class NotificationService extends BaseService {
  constructor(db: Database) {
    super(db);
  }

  /**
   * Create a new notification
   */
  async create(data: NotificationCreate, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const [notification] = await txOrDb
        .insert(notifications)
        .values(data)
        .returning();

      if (!notification) {
        throw new Error("Failed to create notification");
      }

      // Emit event after creation
      void pusher.trigger(
        pusherChannels.notification.name,
        pusherChannels.notification.events.created.name,
        {
          input: data,
          returning: notification,
          userId: data.userId,
        },
      );

      return notification;
    }, tx ?? this.db);
  }

  /**
   * Create notifications in batch
   */
  async createMany(
    dataArray: NotificationCreate[],
    tx?: Transaction | Database,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      if (dataArray.length === 0) return [];

      const createdNotifications = await txOrDb
        .insert(notifications)
        .values(dataArray)
        .returning();

      return createdNotifications;
    }, tx ?? this.db);
  }

  /**
   * Get a notification by ID
   */
  async get(id: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const notification = await txOrDb.query.notifications.findFirst({
        where: eq(notifications.id, id),
      });

      if (!notification) {
        throw new Error("Notification not found");
      }

      return notification;
    }, tx ?? this.db);
  }

  /**
   * Get notifications for a user with filters and pagination
   */
  async getForUser(
    userId: string,
    filters: Partial<NotificationFilter> = { limit: 20, offset: 0 },
    tx?: Transaction | Database,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const { isRead, type, limit = 20, offset = 0 } = filters;

      // Build the where conditions
      const whereConditions = [eq(notifications.userId, userId)];

      if (isRead !== undefined) {
        whereConditions.push(eq(notifications.isRead, isRead));
      }

      if (type) {
        whereConditions.push(eq(notifications.type, type));
      }

      // Get notifications
      const notificationList = await txOrDb.query.notifications.findMany({
        where: and(...whereConditions),
        orderBy: [desc(notifications.createdAt)],
        limit,
        offset,
      });

      // Get total count
      const countResult = await txOrDb
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(...whereConditions));

      const count = countResult?.[0]?.count ?? 0;

      return {
        notifications: notificationList,
        pagination: {
          total: count,
          limit,
          offset,
        },
      };
    }, tx ?? this.db);
  }

  /**
   * Get notifications for a project
   */
  async getForProject(
    projectId: string,
    filters: Partial<NotificationFilter> = { limit: 20, offset: 0 },
    tx?: Transaction | Database,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const { isRead, type, limit = 20, offset = 0 } = filters;

      // Build the where conditions
      const whereConditions = [eq(notifications.projectId, projectId)];

      if (isRead !== undefined) {
        whereConditions.push(eq(notifications.isRead, isRead));
      }

      if (type) {
        whereConditions.push(eq(notifications.type, type));
      }

      // Get notifications
      const notificationList = await txOrDb.query.notifications.findMany({
        where: and(...whereConditions),
        orderBy: [desc(notifications.createdAt)],
        limit,
        offset,
      });

      // Get total count
      const countResult = await txOrDb
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(...whereConditions));

      const count = countResult?.[0]?.count ?? 0;

      return {
        notifications: notificationList,
        pagination: {
          total: count,
          limit,
          offset,
        },
      };
    }, tx ?? this.db);
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(
    userId: string,
    tx?: Transaction | Database,
  ): Promise<number> {
    return this.executeWithTx(async (txOrDb) => {
      const countResult = await txOrDb
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false),
          ),
        );

      return countResult?.[0]?.count ?? 0;
    }, tx ?? this.db);
  }

  /**
   * Update a notification
   */
  async update(
    id: string,
    data: NotificationUpdatePayload,
    tx?: Transaction | Database,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const [updatedNotification] = await txOrDb
        .update(notifications)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(notifications.id, id))
        .returning();

      if (!updatedNotification) {
        throw new Error("Failed to update notification");
      }

      return updatedNotification;
    }, tx ?? this.db);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string, tx?: Transaction | Database) {
    return this.update(id, { isRead: true }, tx);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      await txOrDb
        .update(notifications)
        .set({
          isRead: true,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false),
          ),
        );

      return { success: true };
    }, tx ?? this.db);
  }

  /**
   * Delete a notification
   */
  async delete(id: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      const [deletedNotification] = await txOrDb
        .delete(notifications)
        .where(eq(notifications.id, id))
        .returning();

      if (!deletedNotification) {
        throw new Error("Failed to delete notification");
      }

      return deletedNotification;
    }, tx ?? this.db);
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllForUser(userId: string, tx?: Transaction | Database) {
    return this.executeWithTx(async (txOrDb) => {
      await txOrDb
        .delete(notifications)
        .where(eq(notifications.userId, userId));

      return { success: true };
    }, tx ?? this.db);
  }

  /**
   * Delete read notifications older than a specific date
   */
  async deleteOldReadNotifications(
    olderThan: Date,
    tx?: Transaction | Database,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const result = await txOrDb
        .delete(notifications)
        .where(
          and(
            eq(notifications.isRead, true),
            sql`${notifications.createdAt} < ${olderThan}`,
          ),
        )
        .returning({ id: notifications.id });

      return { count: result.length };
    }, tx ?? this.db);
  }

  /**
   * Generate a notification for the current user
   */
  async createForCurrentUser(
    data: Omit<NotificationCreate, "userId">,
    tx?: Transaction | Database,
  ) {
    return this.executeWithTx(async (txOrDb) => {
      const { userId } = await auth();

      if (!userId) {
        throw new Error("Unauthorized: You must be logged in");
      }

      return this.create(
        {
          ...data,
          userId,
        },
        txOrDb,
      );
    }, tx ?? this.db);
  }
}
