import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/server/api";

export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.board.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}
