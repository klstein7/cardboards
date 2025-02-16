"use client";

import { formatDistanceToNow } from "date-fns";
import { Check, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import {
  useAcceptInvitation,
  useCopyToClipboard,
  useInvitation,
} from "~/lib/hooks";

interface InvitationCardProps {
  invitationId: string;
}

export default function InvitationCard({ invitationId }: InvitationCardProps) {
  const router = useRouter();

  const { copy } = useCopyToClipboard();
  const [accepted, setAccepted] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const invitation = useInvitation(invitationId);

  const acceptInvitationMutation = useAcceptInvitation();

  const handleAccept = async () => {
    await acceptInvitationMutation.mutateAsync(invitationId);
    router.push(`/p/${invitation.data!.projectId}`);
    setAccepted(true);
  };

  if (invitation.isPending) {
    return <div>Loading...</div>;
  }

  if (invitation.isError) {
    throw invitation.error;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span className="text-2xl">✉️</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            You&apos;re Invited!
          </h1>
          <p className="text-muted-foreground">
            You&apos;ve been invited to join the project
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!accepted && (
          <div className="rounded-lg bg-secondary p-4">
            <p className="text-center text-sm text-secondary-foreground">
              Click below to join and get started
            </p>
          </div>
        )}

        {!accepted ? (
          <Button
            className="w-full"
            onClick={handleAccept}
            isLoading={acceptInvitationMutation.isPending}
          >
            Accept Invitation
          </Button>
        ) : (
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Invitation accepted!
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-center text-xs text-muted-foreground">
          Expires in{" "}
          {formatDistanceToNow(invitation.data.expiresAt, {
            addSuffix: true,
          })}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={async () => {
            await copy(window.location.href);
            setShowCopied(true);
            setTimeout(() => {
              setShowCopied(false);
            }, 2000);
          }}
        >
          {showCopied ? (
            <Check className="mr-2 h-4 w-4" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {showCopied ? "Copied!" : "Copy invitation link"}
        </Button>
      </CardFooter>
    </Card>
  );
}
