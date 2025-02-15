import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useAssignToCurrentUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.card.assignToCurrentUser,
    onSuccess: async ({ columnId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["cards", columnId],
      });
    },
  });
}
