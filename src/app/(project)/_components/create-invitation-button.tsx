"use client";

import { Check, Lock, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  useCopyToClipboard,
  useCreateInvitation,
  useStrictCurrentProjectId,
} from "~/lib/hooks";
import { useIsAdmin } from "~/lib/hooks/project-user/use-is-admin";
import { cn } from "~/lib/utils";

export function CreateInvitationButton() {
  const projectId = useStrictCurrentProjectId();
  const { copy } = useCopyToClipboard();
  const createInvitationMutation = useCreateInvitation();
  const [copied, setCopied] = useState(false);
  const isAdmin = useIsAdmin();

  const handleInvite = async () => {
    if (!isAdmin) return;

    const invitation = await createInvitationMutation.mutateAsync(projectId);

    await copy(`${window.location.origin}/i/${invitation.id}`);

    setCopied(true);

    setTimeout(() => setCopied(false), 2000);

    toast.success(
      "Invitation link copied to clipboard! Share it with the users you want to invite! The link will expire in 24 hours.",
    );
  };

  if (!isAdmin) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" disabled>
              <Lock className="mr-1 h-4 w-4" />
              Invite members
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Only admins can invite members</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      isLoading={createInvitationMutation.isPending}
      onClick={handleInvite}
      className={cn(
        "transition-all duration-300",
        copied && "bg-green-600 hover:bg-green-700",
      )}
      disabled={copied || createInvitationMutation.isPending}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 duration-300 animate-in zoom-in-50" />
          <span className="ml-1 duration-300 animate-in slide-in-from-left-2">
            Copied!
          </span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          <span className="ml-1">Invite members</span>
        </>
      )}
    </Button>
  );
}
