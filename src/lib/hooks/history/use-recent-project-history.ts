import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useRecentProjectHistory(limit = 40) {
  const trpc = useTRPC();

  return useQuery(trpc.history.getRecent.queryOptions({ limit }));
}
