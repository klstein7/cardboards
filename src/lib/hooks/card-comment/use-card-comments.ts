import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useCardComments(cardId: number) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.cardComment.list.queryOptions(cardId),
    staleTime: 1000,
  });
}
