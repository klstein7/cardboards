import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useCreateInvitation() {
  const trpc = useTRPC();

  return useMutation({
    ...trpc.invitation.create.mutationOptions(),
  });
}
