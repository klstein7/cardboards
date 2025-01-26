import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { matchSorter } from "match-sorter";

import { api } from "~/server/api";

import { useDebouncedLabels, useDebouncedSearch } from "../utils";

export function useCards(columnId: string) {
  const debouncedSearch = useDebouncedSearch();
  const debouncedLabels = useDebouncedLabels();

  return useQuery({
    queryKey: ["cards", columnId],
    queryFn: () => api.card.list(columnId),
    placeholderData: keepPreviousData,
    staleTime: 1000,
    select: (data) => {
      let filteredData = data;

      if (debouncedSearch) {
        filteredData = matchSorter(data, debouncedSearch.toLowerCase(), {
          keys: ["title", "description"],
          threshold: matchSorter.rankings.CONTAINS,
        });
      }

      if (debouncedLabels.length > 0) {
        filteredData = filteredData.filter((card) =>
          debouncedLabels.some((label) => card.labels?.includes(label)),
        );
      }

      return filteredData;
    },
  });
}
