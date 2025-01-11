import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.card.update,
    onSuccess: ({ columnId: newColumnId, id: cardId }, variables) => {
      const oldColumnId = variables.data.columnId;

      void queryClient.invalidateQueries({
        queryKey: ["cards", newColumnId],
      });

      void queryClient.invalidateQueries({
        queryKey: ["card", cardId],
      });

      if (oldColumnId && oldColumnId !== newColumnId) {
        void queryClient.invalidateQueries({
          queryKey: ["cards", oldColumnId],
        });
      }
    },
  });
}
