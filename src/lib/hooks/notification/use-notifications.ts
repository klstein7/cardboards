import { useQuery } from "@tanstack/react-query";

import { type NotificationFilter } from "~/server/zod";
import { useTRPC } from "~/trpc/client";

/**
 * Hook to fetch notifications for the current user
 * @param filter Optional filter parameters for the notifications
 * @returns Current user's notifications
 */
export function useNotifications(filter?: Partial<NotificationFilter>) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.notification.getCurrentUserNotifications.queryOptions(filter),
  });
}
