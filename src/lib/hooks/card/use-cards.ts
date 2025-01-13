import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useDebouncedSearch } from "~/lib/hooks/utils";
import { api } from "~/server/api";

export function useCards(columnId: string) {
  const debouncedSearch = useDebouncedSearch();

  return useQuery({
    queryKey: ["cards", columnId, debouncedSearch],
    queryFn: () =>
      api.card.list({
        columnId,
        search: {
          search: debouncedSearch ?? undefined,
        },
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000,
  });
}
