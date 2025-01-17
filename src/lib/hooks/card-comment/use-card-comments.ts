import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useCardComments(cardId: number) {
  return useQuery({
    queryKey: ["card-comments", cardId],
    queryFn: async () => {
      const data = await api.cardComment.list(cardId);
      await delay(300);
      return data;
    },
    staleTime: 1000,
  });
}
