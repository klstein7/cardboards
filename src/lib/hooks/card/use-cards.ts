import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";

import { useDebouncedSearch } from "~/lib/hooks/utils";
import { api } from "~/server/api";

export function useCards(columnId: string) {
  const [labels] = useQueryState("labels");
  const debouncedSearch = useDebouncedSearch();

  const formattedLabels = labels ? labels.split(",") : undefined;

  console.log(formattedLabels);

  return useQuery({
    queryKey: ["cards", columnId, debouncedSearch, formattedLabels],
    queryFn: () =>
      api.card.list({
        columnId,
        search: {
          search: debouncedSearch ?? undefined,
          labels: formattedLabels ?? undefined,
        },
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000,
  });
}
