import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useProjectUsers(projectId: string) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.projectUser.list.queryOptions(projectId),
  });
}
