import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useCreateCardComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.cardComment.create,
    onSuccess: ({ cardId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["card-comments", cardId],
      });
    },
  });
}
