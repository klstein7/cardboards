"use client";

import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";

import { useNotificationEvent } from "~/lib/hooks/pusher";
import { useTRPC } from "~/trpc/client";

type RealtimePayload<I, P> = {
  input: I;
  returning: P;
  userId: string;
};

export function NotificationRealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const { userId } = useAuth();

  const isExternalUpdate = (eventUserId: string) => {
    return userId === eventUserId;
  };

  // Notification created
  useNotificationEvent(
    "created",
    (data: RealtimePayload<unknown, { userId: string }>) => {
      const { returning } = data;

      // Only invalidate if the notification is for the current user
      if (returning.userId === userId) {
        void queryClient.invalidateQueries({
          queryKey: trpc.notification.getCurrentUserNotifications.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.notification.getUnreadCount.queryKey(),
        });
      }
    },
  );

  // Notification updated
  useNotificationEvent(
    "updated",
    (data: RealtimePayload<unknown, { userId: string }>) => {
      const { returning, userId: eventUserId } = data;

      // Only invalidate if the notification is for the current user
      if (returning.userId === userId && isExternalUpdate(eventUserId)) {
        void queryClient.invalidateQueries({
          queryKey: trpc.notification.getCurrentUserNotifications.queryKey(),
        });
      }
    },
  );

  // Notification deleted
  useNotificationEvent(
    "deleted",
    (data: RealtimePayload<unknown, { userId: string }>) => {
      const { returning, userId: eventUserId } = data;

      // Only invalidate if the notification is for the current user
      if (returning.userId === userId && isExternalUpdate(eventUserId)) {
        void queryClient.invalidateQueries({
          queryKey: trpc.notification.getCurrentUserNotifications.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.notification.getUnreadCount.queryKey(),
        });
      }
    },
  );

  // Notification marked as read
  useNotificationEvent(
    "markedAsRead",
    (data: RealtimePayload<unknown, { userId: string }>) => {
      const { returning, userId: eventUserId } = data;

      // Only invalidate if the notification is for the current user
      if (returning.userId === userId && isExternalUpdate(eventUserId)) {
        void queryClient.invalidateQueries({
          queryKey: trpc.notification.getCurrentUserNotifications.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.notification.getUnreadCount.queryKey(),
        });
      }
    },
  );

  // All notifications marked as read
  useNotificationEvent(
    "allMarkedAsRead",
    (data: RealtimePayload<unknown, { userId: string }>) => {
      const { returning, userId: eventUserId } = data;

      // Only invalidate if the operation was for the current user
      if (returning.userId === userId && isExternalUpdate(eventUserId)) {
        void queryClient.invalidateQueries({
          queryKey: trpc.notification.getCurrentUserNotifications.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.notification.getUnreadCount.queryKey(),
        });
      }
    },
  );

  return <>{children}</>;
}
