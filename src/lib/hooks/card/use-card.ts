import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useCard(cardId?: number | null) {
  return useQuery({
    queryKey: ["card", cardId],
    queryFn: async () => {
      if (!cardId) throw new Error("No card ID provided");
      return api.card.get(cardId);
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: !!cardId,
  });
}
