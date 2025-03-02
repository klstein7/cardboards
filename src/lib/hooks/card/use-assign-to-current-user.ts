import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useAssignToCurrentUser() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.card.assignToCurrentUser.mutationOptions({
      onSuccess: async ({ columnId }) => {
        await queryClient.invalidateQueries({
          queryKey: ["cards", columnId],
        });
      },
    }),
  });
}
