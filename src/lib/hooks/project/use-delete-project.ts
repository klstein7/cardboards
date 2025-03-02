import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useDeleteProject() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.project.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["projects"] });
      },
    }),
  });
}
