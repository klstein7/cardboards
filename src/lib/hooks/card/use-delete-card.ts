import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useDeleteCard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.card.delete.mutationOptions({
      onSuccess: (_, cardId) => {
        // Get the columnId from the card data
        const cardData = queryClient.getQueryData<{ columnId: string }>(
          trpc.card.get.queryKey(cardId),
        );

        if (cardData?.columnId) {
          void queryClient.invalidateQueries({
            queryKey: trpc.card.list.queryKey(cardData.columnId),
          });
        }
      },
    }),
  });
}
