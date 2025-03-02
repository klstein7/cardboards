import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useCard(cardId?: number | null) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.card.get.queryOptions(cardId!, {
      enabled: !!cardId,
      retry: false,
      staleTime: 1000 * 60 * 5,
    }),
  });
}
