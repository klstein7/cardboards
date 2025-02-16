import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useUpdateProjectUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.projectUser.update,
    onSuccess: async ({ projectId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["project-users", projectId],
      });
    },
  });
}
