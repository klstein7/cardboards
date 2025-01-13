import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

import { useDebouncedSearch } from "..";

export function useCreateCard() {
  const queryClient = useQueryClient();
  const debouncedSearch = useDebouncedSearch();

  return useMutation({
    mutationFn: api.card.create,
    onSuccess: ({ columnId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["cards", columnId, debouncedSearch],
      });
    },
  });
}
