import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useCard(cardId?: number | null) {
  return useQuery({
    queryKey: ["card", cardId],
    queryFn: () => api.card.get(cardId!),
    enabled: !!cardId,
  });
}
