import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useBoardCountByProjectId(projectId: string) {
  return useQuery({
    queryKey: ["board-count-by-project-id", projectId],
    queryFn: () => api.board.countByProjectId(projectId),
  });
}
