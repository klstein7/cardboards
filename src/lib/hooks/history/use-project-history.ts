import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

/**
 * Hook to fetch history for a project
 * @param projectId The ID of the project
 * @returns The project history
 */
export function useProjectHistory(projectId: string | undefined) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.history.getByProject.queryOptions({
      projectId: projectId!,
    }),
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch paginated history for a project
 * @param projectId The ID of the project
 * @param limit The number of items to fetch
 * @param offset The offset for pagination
 * @returns The project history with pagination
 */
export function useProjectHistoryPaginated(
  projectId: string | undefined,
  limit = 10,
  offset = 0,
) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.history.getByProjectPaginated.queryOptions({
      projectId: projectId!,
      limit,
      offset,
    }),
    enabled: !!projectId,
  });
}
