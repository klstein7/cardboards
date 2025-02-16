import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { api } from "~/server/api";

import InvitationCard from "../../_components/invitation-card";

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const { invitationId } = await params;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["invitation", invitationId],
    queryFn: () => api.invitation.get(invitationId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <InvitationCard invitationId={invitationId} />
      </div>
    </HydrationBoundary>
  );
}
