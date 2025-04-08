import { useQuery } from "@tanstack/react-query";

import { type NotificationFilter } from "~/server/zod";
import { useTRPC } from "~/trpc/client";

/**
 * Hook to fetch notifications for a specific project
 * @param projectId The ID of the project
 * @param filter Optional filter parameters for the notifications
 * @returns Project notifications
 */
export function useProjectNotifications(
  projectId: string | undefined,
  filter?: Partial<NotificationFilter>,
) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.notification.getProjectNotifications.queryOptions({
      projectId: projectId!,
      filter,
    }),
    enabled: !!projectId,
  });
}
