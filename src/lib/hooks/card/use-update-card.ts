import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.card.update,
    onSuccess: async ({ columnId: newColumnId, id: cardId }, variables) => {
      const oldColumnId = variables.data.columnId;

      await queryClient.invalidateQueries({
        queryKey: ["cards", newColumnId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["card", cardId],
      });

      if (oldColumnId && oldColumnId !== newColumnId) {
        await queryClient.invalidateQueries({
          queryKey: ["cards", oldColumnId],
        });
      }
    },
  });
}
