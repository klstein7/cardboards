import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

import { useCurrentProjectId } from "../utils";

export function useCurrentProjectUser() {
  const projectId = useCurrentProjectId();

  return useQuery({
    queryKey: ["current-project-user", projectId],
    queryFn: () => api.projectUser.getCurrentProjectUser(projectId),
  });
}
