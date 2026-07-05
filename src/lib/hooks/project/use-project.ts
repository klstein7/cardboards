import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useProject(projectId: string) {
  const trpc = useTRPC();
  return useQuery(trpc.project.get.queryOptions(projectId));
}
