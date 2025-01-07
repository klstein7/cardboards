import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/server/api";

export function useMoveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.card.move,
    onSuccess: ({ previousColumnId, newColumnId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["cards", previousColumnId],
      });
      if (previousColumnId !== newColumnId) {
        void queryClient.invalidateQueries({
          queryKey: ["cards", newColumnId],
        });
      }
    },
  });
}
