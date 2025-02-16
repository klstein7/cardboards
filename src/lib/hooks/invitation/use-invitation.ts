import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export const useInvitation = (invitationId: string) => {
  return useQuery({
    queryKey: ["invitation", invitationId],
    queryFn: () => api.invitation.get(invitationId),
  });
};
