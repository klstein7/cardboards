import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useProjectUserCountByProjectId(projectId: string) {
  return useQuery({
    queryKey: ["project-user-count-by-project-id", projectId],
    queryFn: () => api.projectUser.countByProjectId(projectId),
  });
}
