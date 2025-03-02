import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useCreateManyCards() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.card.createMany.mutationOptions({
      onSuccess: async (cards) => {
        cards.forEach((card) => {
          void queryClient.invalidateQueries({
            queryKey: ["cards", card.columnId],
          });
        });
      },
    }),
  });
}
