"use client";

import { useCardComments } from "~/lib/hooks";

import { CardDetailsCommentItem } from "./card-details-comment-item";
import { CardDetailsCommentSkeleton } from "./card-details-comment-skeleton";

export function CardDetailsCommentList({ cardId }: { cardId: number }) {
  const cardComments = useCardComments(cardId);

  if (cardComments.isError) {
    return (
      <p className="py-4 text-sm text-destructive">
        Error: {cardComments.error.message}
      </p>
    );
  }

  if (cardComments.isPending)
    return (
      <div className="divide-y divide-border/60">
        <CardDetailsCommentSkeleton />
        <CardDetailsCommentSkeleton />
      </div>
    );

  if (cardComments.data.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">No comments yet.</p>;
  }

  return (
    <div className="divide-y divide-border/60">
      {cardComments.data.map((comment) => (
        <CardDetailsCommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
