import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useUpdateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.column.update,
    onSuccess: async ({ boardId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["columns", boardId],
      });
    },
  });
}
