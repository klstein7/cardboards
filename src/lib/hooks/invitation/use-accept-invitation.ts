import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useAcceptInvitation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.invitation.accept.mutationOptions({
      onSuccess: async (_, invitationId) => {
        await queryClient.invalidateQueries({
          queryKey: ["invitation", invitationId],
        });
      },
    }),
  });
}
