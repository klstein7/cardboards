import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useProjectUsers(projectId: string) {
  return useQuery({
    queryKey: ["project-users", projectId],
    queryFn: () => api.projectUser.list(projectId),
    placeholderData: [],
  });
}
