import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useProjects() {
  const trpc = useTRPC();
  return useQuery(trpc.project.list.queryOptions());
}
