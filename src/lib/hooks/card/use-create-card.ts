import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.card.create,
    onSuccess: ({ columnId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["cards", columnId],
      });
    },
  });
}
