import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useCards(columnId: string) {
  return useQuery({
    queryKey: ["cards", columnId],
    queryFn: () => api.card.list(columnId),
    placeholderData: [],
  });
}
