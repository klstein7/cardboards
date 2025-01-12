import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useRemoveCardComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.cardComment.remove,
    onSuccess: async ({ cardId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["card-comments", cardId],
      });
    },
  });
}
