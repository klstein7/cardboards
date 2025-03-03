import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useUpdateProject() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.project.update.mutationOptions({
      onSuccess: (_, variables) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.project.get.queryKey(variables.projectId),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.project.list.queryKey(),
        });
      },
    }),
  });
}
