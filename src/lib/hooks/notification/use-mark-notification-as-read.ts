import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

/**
 * Hook to mark a notification as read
 * @returns Mutation function to mark a notification as read
 */
export function useMarkNotificationAsRead() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.notification.markAsRead.mutationOptions({
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
