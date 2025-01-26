import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useUpdateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.board.update,
    onSuccess: async ({ projectId }) => {
      await queryClient.invalidateQueries({ queryKey: ["boards", projectId] });
    },
  });
}
