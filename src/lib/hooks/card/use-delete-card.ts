import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useDeleteCard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.card.delete.mutationOptions({
      onSuccess: ({ columnId }) => {
        void queryClient.invalidateQueries({ queryKey: ["cards", columnId] });
      },
    }),
  });
}
