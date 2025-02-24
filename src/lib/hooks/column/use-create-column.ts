import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useCreateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.column.create,
    onSuccess: async ({ boardId }) => {
      await queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
    },
  });
}
