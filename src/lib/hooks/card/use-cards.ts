import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { matchSorter } from "match-sorter";

import { useTRPC } from "~/trpc/client";

import { useDebouncedLabels, useDebouncedSearch } from "../utils";
import { useDebouncedAssignedTo } from "../utils/use-debounded-assigned-to";

export function useCards(columnId: string) {
  const trpc = useTRPC();
  const debouncedSearch = useDebouncedSearch();
  const debouncedLabels = useDebouncedLabels();
  const debouncedAssignedTo = useDebouncedAssignedTo();

  return useQuery({
    ...trpc.card.list.queryOptions(columnId),
    placeholderData: keepPreviousData,
    staleTime: 1000,
    select: (data) => {
      let filteredData = data;

      if (debouncedSearch) {
        filteredData = matchSorter(
          filteredData,
          debouncedSearch.toLowerCase(),
          {
            keys: ["title", "description"],
            threshold: matchSorter.rankings.CONTAINS,
          },
        );
      }

      if (debouncedLabels && debouncedLabels.length > 0) {
        filteredData = filteredData.filter((card) =>
          card.labels?.some((label) => debouncedLabels.includes(label)),
        );
      }

      if (debouncedAssignedTo && debouncedAssignedTo.length > 0) {
        filteredData = filteredData.filter(
          (card) =>
            card.assignedToId &&
            debouncedAssignedTo.includes(card.assignedToId),
        );
      }

      return filteredData;
    },
  });
}
