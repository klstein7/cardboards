import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useCardCountByProjectId(projectId: string) {
  return useQuery({
    queryKey: ["card-count-by-project-id", projectId],
    queryFn: () => api.card.countByProjectId(projectId),
  });
}
