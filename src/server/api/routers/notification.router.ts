import { z } from "zod";

import { pusherChannels } from "~/pusher/channels";
import { pusher } from "~/pusher/server";
import { services } from "~/server/services/container";
import {
  NotificationFilterSchema,
  NotificationUpdatePayloadSchema,
} from "~/server/zod";
import { authedProcedure, createTRPCRouter } from "~/trpc/init";

export const notificationRouter = createTRPCRouter({
  // Get notifications for the current user
  getCurrentUserNotifications: authedProcedure
    .input(NotificationFilterSchema.optional())
    .query(async ({ ctx, input }) => {
      return services.notificationService.getForUser(ctx.userId, input);
    }),

  // Get notifications for a project
  getProjectNotifications: authedProcedure
    .input(
      z.object({
        projectId: z.string(),
        filter: NotificationFilterSchema.optional(),
      }),
    )
    .query(async ({ input }) => {
      await services.authService.canAccessProject(input.projectId);
      return services.notificationService.getForProject(
        input.projectId,
        input.filter,
      );
    }),

  // Get unread count for current user
  getUnreadCount: authedProcedure.query(async ({ ctx }) => {
    return services.notificationService.getUnreadCount(ctx.userId);
  }),

  // Mark a notification as read
  markAsRead: authedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const notification = await services.notificationService.get(input);

      // Check if notification belongs to current user
      if (notification.userId !== ctx.userId) {
        throw new Error(
          "Unauthorized: This notification doesn't belong to you",
        );
      }

      const updatedNotification =
        await services.notificationService.markAsRead(input);

      await pusher.trigger(
        pusherChannels.notification.name,
        pusherChannels.notification.events.markedAsRead.name,
        {
          input,
          returning: updatedNotification,
          userId: ctx.userId,
        },
      );

      return updatedNotification;
    }),

  // Mark all notifications as read for current user
  markAllAsRead: authedProcedure.mutation(async ({ ctx }) => {
    const result = await services.notificationService.markAllAsRead(ctx.userId);

    await pusher.trigger(
      pusherChannels.notification.name,
      pusherChannels.notification.events.allMarkedAsRead.name,
      {
        input: null,
        returning: { userId: ctx.userId },
        userId: ctx.userId,
      },
    );

    return result;
  }),

  // Update a notification
  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        data: NotificationUpdatePayloadSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const notification = await services.notificationService.get(input.id);

      // Check if notification belongs to current user
      if (notification.userId !== ctx.userId) {
        throw new Error(
          "Unauthorized: This notification doesn't belong to you",
        );
      }

      const updatedNotification = await services.notificationService.update(
        input.id,
        input.data,
      );

      await pusher.trigger(
        pusherChannels.notification.name,
        pusherChannels.notification.events.updated.name,
        {
          input,
          returning: updatedNotification,
          userId: ctx.userId,
        },
      );

      return updatedNotification;
    }),

  // Delete a notification
  delete: authedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const notification = await services.notificationService.get(input);

    // Check if notification belongs to current user
    if (notification.userId !== ctx.userId) {
      throw new Error("Unauthorized: This notification doesn't belong to you");
    }

    const deletedNotification =
      await services.notificationService.delete(input);

    await pusher.trigger(
      pusherChannels.notification.name,
      pusherChannels.notification.events.deleted.name,
      {
        input,
        returning: deletedNotification,
        userId: ctx.userId,
      },
    );

    return deletedNotification;
  }),

  // Delete all notifications for current user
  deleteAll: authedProcedure.mutation(async ({ ctx }) => {
    const result = await services.notificationService.deleteAllForUser(
      ctx.userId,
    );

    await pusher.trigger(
      pusherChannels.notification.name,
      pusherChannels.notification.events.allMarkedAsRead.name,
      {
        input: null,
        returning: { userId: ctx.userId },
        userId: ctx.userId,
      },
    );

    return result;
  }),
});
