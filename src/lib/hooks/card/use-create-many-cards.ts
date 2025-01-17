import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useCreateManyCards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.card.createMany,
    onSuccess: async (cards) => {
      cards.forEach((card) => {
        void queryClient.invalidateQueries({
          queryKey: ["cards", card.columnId],
        });
      });
    },
  });
}
