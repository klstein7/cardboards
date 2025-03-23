import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useUpdateCurrentUserPreferences() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.projectUser.updateCurrentUserPreferences.mutationOptions({
      onSuccess: (updatedUser) => {
        // Invalidate queries that would be affected by this change
        void queryClient.invalidateQueries({
          queryKey: trpc.projectUser.getCurrentProjectUser.queryKey(
            updatedUser.projectId,
          ),
        });

        void queryClient.invalidateQueries({
          queryKey: trpc.projectUser.list.queryKey(updatedUser.projectId),
        });
      },
    }),
  });
}
