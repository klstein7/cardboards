import { type Metadata } from "next";

import { HydrateClient, trpc } from "~/trpc/server";

import InvitationCard from "../../_components/invitation-card";

export const metadata: Metadata = {
  title: "Invitation | cardboards",
  description: "Accept your invitation to join a project",
};

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const { invitationId } = await params;

  // Prefetch the invitation data
  await trpc.invitation.get.prefetch(invitationId);

  return (
    <HydrateClient>
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <InvitationCard invitationId={invitationId} />
      </div>
    </HydrateClient>
  );
}
