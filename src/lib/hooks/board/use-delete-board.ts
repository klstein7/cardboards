import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useDeleteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.board.del,
    onSuccess: async ({ projectId }) => {
      await queryClient.invalidateQueries({ queryKey: ["boards", projectId] });
    },
  });
}
