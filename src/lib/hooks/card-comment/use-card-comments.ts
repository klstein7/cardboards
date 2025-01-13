import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useCardComments(cardId: number) {
  return useQuery({
    queryKey: ["card-comments", cardId],
    queryFn: () => api.cardComment.list(cardId),
  });
}
