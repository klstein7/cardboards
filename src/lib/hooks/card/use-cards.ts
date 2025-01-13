import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";

import { useDebounce } from "~/lib/hooks/utils";
import { api } from "~/server/api";

export function useCards(columnId: string) {
  const [search] = useQueryState("search");
  const debouncedSearch = useDebounce(search);

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
