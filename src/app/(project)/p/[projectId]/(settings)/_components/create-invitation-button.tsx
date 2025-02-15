"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  useCopyToClipboard,
  useCreateInvitation,
  useCurrentProjectId,
} from "~/lib/hooks";

export function CreateInvitationButton() {
  const projectId = useCurrentProjectId();

  const { copy } = useCopyToClipboard();

  const createInvitationMutation = useCreateInvitation();

  return (
    <Button
      isLoading={createInvitationMutation.isPending}
      onClick={async () => {
        const invitation =
          await createInvitationMutation.mutateAsync(projectId);

        await copy(`${window.location.origin}/i/${invitation.id}`);

        toast.success(
          "Invitation link copied to clipboard! Share it with the users you want to invite! The link will expire in 24 hours.",
        );
      }}
    >
      <Plus className="h-4 w-4" />
      Invite
    </Button>
  );
}
