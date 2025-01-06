import { useQuery } from "@tanstack/react-query";
import { api } from "~/server/api";

export function useBoards(projectId: string) {
  return useQuery({
    queryKey: ["boards", projectId],
    queryFn: () => api.board.list(projectId),
    placeholderData: [],
  });
}
