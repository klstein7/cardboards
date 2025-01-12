import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useUpdateCardComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.cardComment.update,
    onSuccess: async ({ cardId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["card-comments", cardId],
      });
    },
  });
}
