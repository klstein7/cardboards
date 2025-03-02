import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useAcceptInvitation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.invitation.accept.mutationOptions({
      onSuccess: async (_, invitationId) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.invitation.get.queryKey(invitationId),
        });

        // Also invalidate the project and projectUser lists as they might have been updated
        await queryClient.invalidateQueries({
          queryKey: trpc.project.list.queryKey(),
        });

        await queryClient.invalidateQueries({
          queryKey: trpc.projectUser.list.queryKey(),
        });
      },
    }),
  });
}
