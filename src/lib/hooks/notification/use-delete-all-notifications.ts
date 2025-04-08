import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

/**
 * Hook to delete all notifications for the current user
 * @returns Mutation function to delete all notifications
 */
export function useDeleteAllNotifications() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.notification.deleteAll.mutationOptions({
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
