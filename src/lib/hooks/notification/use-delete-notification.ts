import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

/**
 * Hook to delete a notification
 * @returns Mutation function to delete a notification
 */
export function useDeleteNotification() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.notification.delete.mutationOptions({
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
