import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

/**
 * Hook to mark all notifications as read for the current user
 * @returns Mutation function to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.notification.markAllAsRead.mutationOptions({
      onSuccess: async () => {
        // Invalidate notifications queries
        await queryClient.invalidateQueries({
          queryKey: trpc.notification.getCurrentUserNotifications.queryKey(),
        });

        // Invalidate unread count query
        await queryClient.invalidateQueries({
          queryKey: trpc.notification.getUnreadCount.queryKey(),
        });
      },
    }),
  });
}
