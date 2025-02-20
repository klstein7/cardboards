import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useGenerateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.board.generate,
    onSuccess: async ({ projectId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["boards", projectId],
      });
    },
  });
}
