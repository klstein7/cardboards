import { auth } from "@clerk/nextjs/server";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { and, desc, eq, sql } from "drizzle-orm";

import { mockDb, mockTx } from "../../../../test/mocks";
import { notifications } from "../../db/schema";
import { NotificationService } from "../notification.service";
import { pusher } from "~/pusher/server";
import { pusherChannels } from "~/pusher/channels";

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

// Mock Pusher
vi.mock("~/pusher/server", () => ({
  pusher: {
    trigger: vi.fn(),
  },
}));

describe("NotificationService", () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    // Create a new instance of NotificationService before each test
    notificationService = new NotificationService(mockDb);

    // Reset all mocks
    vi.resetAllMocks();

    // Default auth mock
    vi.mocked(auth).mockReturnValue({
      userId: "user-123",
    } as any);
  });

  describe("create", () => {
    it("should create a new notification", async () => {
      // Setup
      const notificationData = {
        userId: "user-123",
        projectId: "project-123",
        entityType: "card" as const,
        entityId: "card-123",
        type: "assignment" as const,
        title: "You were assigned to a card",
        content: "You have been assigned to Card #123",
      };

      const createdNotification = {
        id: "notification-123",
        ...notificationData,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock insert operation
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([createdNotification]),
      } as any);

      // Execute
      const result = await notificationService.create(notificationData);

      // Assert
      expect(result).toEqual(createdNotification);
      expect(mockDb.insert).toHaveBeenCalledWith(notifications);
      expect(mockDb.insert(notifications).values).toHaveBeenCalledWith(
        notificationData,
      );
      expect(pusher.trigger).toHaveBeenCalledWith(
        pusherChannels.notification.name,
        pusherChannels.notification.events.created.name,
        {
          input: notificationData,
          returning: createdNotification,
          userId: notificationData.userId,
        },
      );
    });

    it("should throw if insertion fails", async () => {
      // Setup
      const notificationData = {
        userId: "user-123",
        projectId: "project-123",
        entityType: "card" as const,
        entityId: "card-123",
        type: "assignment" as const,
        title: "You were assigned to a card",
        content: "You have been assigned to Card #123",
      };

      // Mock insert operation to return empty array (failed insert)
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
      } as any);

      // Assert
      await expect(
        notificationService.create(notificationData),
      ).rejects.toThrow("Failed to create notification");
    });

    it("should use transaction when provided", async () => {
      // Setup
      const notificationData = {
        userId: "user-123",
        projectId: "project-123",
        entityType: "card" as const,
        entityId: "card-123",
        type: "assignment" as const,
        title: "You were assigned to a card",
        content: "You have been assigned to Card #123",
      };

      const createdNotification = {
        id: "notification-123",
        ...notificationData,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock transaction insert operation
      mockTx.insert.mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([createdNotification]),
      } as any);

      // Execute
      const result = await notificationService.create(notificationData, mockTx);

      // Assert
      expect(result).toEqual(createdNotification);
      expect(mockTx.insert).toHaveBeenCalledWith(notifications);
      expect(mockTx.insert(notifications).values).toHaveBeenCalledWith(
        notificationData,
      );
      // Ensure DB wasn't used directly
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe("createMany", () => {
    it("should create multiple notifications", async () => {
      // Setup
      const notificationsData = [
        {
          userId: "user-123",
          projectId: "project-123",
          entityType: "card" as const,
          entityId: "card-123",
          type: "assignment" as const,
          title: "Assignment 1",
          content: "Content 1",
        },
        {
          userId: "user-456",
          projectId: "project-123",
          entityType: "card" as const,
          entityId: "card-456",
          type: "comment" as const,
          title: "Comment 1",
          content: "Content 2",
        },
      ];

      const createdNotifications = notificationsData.map((data, index) => ({
        id: `notification-${index}`,
        ...data,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Mock insert operation
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue(createdNotifications),
      } as any);

      // Execute
      const result = await notificationService.createMany(notificationsData);

      // Assert
      expect(result).toEqual(createdNotifications);
      expect(mockDb.insert).toHaveBeenCalledWith(notifications);
      expect(mockDb.insert(notifications).values).toHaveBeenCalledWith(
        notificationsData,
      );
    });

    it("should return empty array if no notifications to create", async () => {
      // Execute
      const result = await notificationService.createMany([]);

      // Assert
      expect(result).toEqual([]);
      // Ensure insert was not called
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe("get", () => {
    it("should get a notification by ID", async () => {
      // Setup
      const notificationId = "notification-123";
      const notification = {
        id: notificationId,
        userId: "user-123",
        projectId: "project-123",
        entityType: "card",
        entityId: "card-123",
        type: "assignment",
        title: "You were assigned to a card",
        content: "You have been assigned to Card #123",
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock query operations
      mockDb.query = {
        notifications: {
          findFirst: vi.fn().mockResolvedValue(notification),
        },
      } as any;

      // Execute
      const result = await notificationService.get(notificationId);

      // Assert
      expect(result).toEqual(notification);
      expect(mockDb.query.notifications.findFirst).toHaveBeenCalledWith({
        where: eq(notifications.id, notificationId),
      });
    });

    it("should throw if notification not found", async () => {
      // Setup
      const notificationId = "nonexistent-notification";

      // Mock query operations to return null (not found)
      mockDb.query = {
        notifications: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      } as any;

      // Assert
      await expect(notificationService.get(notificationId)).rejects.toThrow(
        "Notification not found",
      );
    });
  });

  describe("getForUser", () => {
    it("should get notifications for a user with default filters", async () => {
      // Setup
      const userId = "user-123";
      const mockNotifications = [
        {
          id: "notification-1",
          userId,
          type: "assignment",
          isRead: false,
        },
        {
          id: "notification-2",
          userId,
          type: "comment",
          isRead: true,
        },
      ];

      // Mock query operations
      mockDb.query = {
        notifications: {
          findMany: vi.fn().mockResolvedValue(mockNotifications),
        },
      } as any;

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 2 }]),
      } as any);

      // Execute
      const result = await notificationService.getForUser(userId);

      // Assert
      expect(result).toEqual({
        notifications: mockNotifications,
        pagination: {
          total: 2,
          limit: 20,
          offset: 0,
        },
      });
      expect(mockDb.query.notifications.findMany).toHaveBeenCalledWith({
        where: and(eq(notifications.userId, userId)),
        orderBy: [desc(notifications.createdAt)],
        limit: 20,
        offset: 0,
      });
    });

    it("should apply isRead and type filters when provided", async () => {
      // Setup
      const userId = "user-123";
      const filters = {
        isRead: false,
        type: "assignment" as const,
        limit: 10,
        offset: 5,
      };

      const mockNotifications = [
        {
          id: "notification-1",
          userId,
          type: "assignment",
          isRead: false,
        },
      ];

      // Mock query operations
      mockDb.query = {
        notifications: {
          findMany: vi.fn().mockResolvedValue(mockNotifications),
        },
      } as any;

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 1 }]),
      } as any);

      // Execute
      const result = await notificationService.getForUser(userId, filters);

      // Assert
      expect(result).toEqual({
        notifications: mockNotifications,
        pagination: {
          total: 1,
          limit: filters.limit,
          offset: filters.offset,
        },
      });
      expect(mockDb.query.notifications.findMany).toHaveBeenCalledWith({
        where: and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, filters.isRead),
          eq(notifications.type, filters.type),
        ),
        orderBy: [desc(notifications.createdAt)],
        limit: filters.limit,
        offset: filters.offset,
      });
    });
  });

  describe("getUnreadCount", () => {
    it("should get unread count for a user", async () => {
      // Setup
      const userId = "user-123";

      // Mock select operation
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 5 }]),
      } as any);

      // Execute
      const result = await notificationService.getUnreadCount(userId);

      // Assert
      expect(result).toBe(5);
      expect(mockDb.select).toHaveBeenCalledWith({
        count: sql<number>`count(*)`,
      });
      expect(mockDb.select().from).toHaveBeenCalledWith(notifications);
      expect(mockDb.select().from(notifications).where).toHaveBeenCalledWith(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
      );
    });

    it("should return 0 if no results", async () => {
      // Setup
      const userId = "user-123";

      // Mock select operation with null result
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      } as any);

      // Execute
      const result = await notificationService.getUnreadCount(userId);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe("update", () => {
    it("should update a notification", async () => {
      // Setup
      const notificationId = "notification-123";
      const updateData = {
        isRead: true,
        title: "Updated Title",
      };

      const updatedNotification = {
        id: notificationId,
        userId: "user-123",
        isRead: true,
        title: "Updated Title",
        updatedAt: new Date(),
      };

      // Mock update operation
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([updatedNotification]),
      } as any);

      // Execute
      const result = await notificationService.update(
        notificationId,
        updateData,
      );

      // Assert
      expect(result).toEqual(updatedNotification);
      expect(mockDb.update).toHaveBeenCalledWith(notifications);
      expect(mockDb.update(notifications).set).toHaveBeenCalledWith({
        ...updateData,
        updatedAt: expect.any(Date),
      });
      expect(
        mockDb.update(notifications).set({
          ...updateData,
          updatedAt: expect.any(Date),
        }).where,
      ).toHaveBeenCalledWith(eq(notifications.id, notificationId));
    });

    it("should throw if notification update fails", async () => {
      // Setup
      const notificationId = "nonexistent-notification";
      const updateData = { isRead: true };

      // Mock update operation to return empty array (failed update)
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
      } as any);

      // Assert
      await expect(
        notificationService.update(notificationId, updateData),
      ).rejects.toThrow("Failed to update notification");
    });
  });

  describe("markAsRead", () => {
    it("should mark a notification as read", async () => {
      // Setup
      const notificationId = "notification-123";
      const updatedNotification = {
        id: notificationId,
        isRead: true,
        updatedAt: new Date(),
      };

      // Spy on the update method
      vi.spyOn(notificationService, "update").mockResolvedValue(
        updatedNotification as any,
      );

      // Execute
      const result = await notificationService.markAsRead(notificationId);

      // Assert
      expect(result).toEqual(updatedNotification);
      expect(notificationService.update).toHaveBeenCalledWith(
        notificationId,
        { isRead: true },
        undefined,
      );
    });

    it("should use transaction when provided", async () => {
      // Setup
      const notificationId = "notification-123";
      const updatedNotification = {
        id: notificationId,
        isRead: true,
        updatedAt: new Date(),
      };

      // Spy on the update method
      vi.spyOn(notificationService, "update").mockResolvedValue(
        updatedNotification as any,
      );

      // Execute
      const result = await notificationService.markAsRead(
        notificationId,
        mockTx,
      );

      // Assert
      expect(result).toEqual(updatedNotification);
      expect(notificationService.update).toHaveBeenCalledWith(
        notificationId,
        { isRead: true },
        mockTx,
      );
    });
  });

  describe("createForCurrentUser", () => {
    it("should create a notification for the current user", async () => {
      // Setup
      const notificationData = {
        projectId: "project-123",
        entityType: "card" as const,
        entityId: "card-123",
        type: "assignment" as const,
        title: "You were assigned to a card",
        content: "You have been assigned to Card #123",
      };

      const userId = "user-123";
      const createdNotification = {
        id: "notification-123",
        userId,
        ...notificationData,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Spy on the create method
      vi.spyOn(notificationService, "create").mockResolvedValue(
        createdNotification as any,
      );

      // Execute
      const result =
        await notificationService.createForCurrentUser(notificationData);

      // Assert
      expect(result).toEqual(createdNotification);
      expect(notificationService.create).toHaveBeenCalledWith(
        {
          ...notificationData,
          userId,
        },
        expect.anything(),
      );
    });
  });
});
