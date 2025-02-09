import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.card.del,
    onSuccess: ({ columnId }) => {
      void queryClient.invalidateQueries({ queryKey: ["cards", columnId] });
    },
  });
}
