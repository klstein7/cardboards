import { useMutation } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useCreateInvitation() {
  return useMutation({
    mutationFn: api.invitation.create,
  });
}
