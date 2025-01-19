import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.project.del,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
