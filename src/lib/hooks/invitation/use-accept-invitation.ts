import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.invitation.accept,
    onSuccess: async (_, invitationId) => {
      await queryClient.invalidateQueries({
        queryKey: ["invitation", invitationId],
      });
    },
  });
}
