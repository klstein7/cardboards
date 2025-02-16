import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => api.project.list(),
    placeholderData: [],
  });
}
