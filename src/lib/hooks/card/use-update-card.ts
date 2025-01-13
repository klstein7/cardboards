import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

import { useDebouncedSearch } from "../utils";

export function useUpdateCard() {
  const queryClient = useQueryClient();
  const debouncedSearch = useDebouncedSearch();

  return useMutation({
    mutationFn: api.card.update,
    onSuccess: async ({ columnId: newColumnId, id: cardId }, variables) => {
      const oldColumnId = variables.data.columnId;

      await queryClient.invalidateQueries({
        queryKey: ["cards", newColumnId, debouncedSearch],
      });

      await queryClient.invalidateQueries({
        queryKey: ["card", cardId],
      });

      if (oldColumnId && oldColumnId !== newColumnId) {
        await queryClient.invalidateQueries({
          queryKey: ["cards", oldColumnId, debouncedSearch],
        });
      }
    },
  });
}
