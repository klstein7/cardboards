import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useCreateProject() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.project.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["projects"] });
      },
    }),
  });
}
