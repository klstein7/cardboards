import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

/**
 * Hook to fetch the count of unread notifications for the current user
 * @returns The unread notification count
 */
export function useNotificationUnreadCount() {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.notification.getUnreadCount.queryOptions(),
  });
}
