"use client";

import { MessageSquare } from "lucide-react";

import { useCardComments } from "~/lib/hooks";

import { CardDetailsCommentItem } from "./card-details-comment-item";
import { CardDetailsCommentSkeleton } from "./card-details-comment-skeleton";

export function CardDetailsCommentList({ cardId }: { cardId: number }) {
  const cardComments = useCardComments(cardId);

  if (cardComments.isError) {
    return (
      <div className="mt-3 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        Error: {cardComments.error.message}
      </div>
    );
  }

  if (cardComments.isPending)
    return (
      <div className="mt-3 space-y-4">
        <CardDetailsCommentSkeleton />
        <CardDetailsCommentSkeleton />
        <CardDetailsCommentSkeleton />
      </div>
    );

  if (cardComments.data.length === 0) {
    return (
      <div className="mt-3 rounded-md border border-border/20 bg-muted/20 p-6 text-center">
        <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
        <p className="text-sm font-medium text-muted-foreground">
          No comments yet. Be the first to comment!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-5">
      {cardComments.data.map((comment) => (
        <CardDetailsCommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
