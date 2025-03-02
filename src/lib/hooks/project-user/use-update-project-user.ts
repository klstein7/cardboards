import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useUpdateProjectUser() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.projectUser.update.mutationOptions({
      onSuccess: (updatedUser) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.projectUser.list.queryKey(updatedUser.projectId),
        });
      },
    }),
  });
}
