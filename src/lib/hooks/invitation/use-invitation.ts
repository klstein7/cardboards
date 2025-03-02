import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export const useInvitation = (invitationId: string) => {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.invitation.get.queryOptions(invitationId),
  });
};
