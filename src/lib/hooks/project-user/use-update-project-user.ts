import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useUpdateProjectUser() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.projectUser.update.mutationOptions({
      onSuccess: async ({ projectId }) => {
        await queryClient.invalidateQueries({
          queryKey: ["project-users", projectId],
        });
      },
    }),
  });
}
