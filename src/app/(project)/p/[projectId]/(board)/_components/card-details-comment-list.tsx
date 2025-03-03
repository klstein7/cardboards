"use client";

import { Separator } from "~/components/ui/separator";
import { useCardComments } from "~/lib/hooks";

import { CardDetailsCommentItem } from "./card-details-comment-item";
import { CardDetailsCommentSkeleton } from "./card-details-comment-skeleton";

export function CardDetailsCommentList({ cardId }: { cardId: number }) {
  const cardComments = useCardComments(cardId);

  if (cardComments.isError) {
    return <div>Error: {cardComments.error.message}</div>;
  }

  if (cardComments.isPending)
    return (
      <>
        <Separator />
        <div className="flex flex-col gap-6">
          <CardDetailsCommentSkeleton />
          <CardDetailsCommentSkeleton />
          <CardDetailsCommentSkeleton />
        </div>
      </>
    );

  if (cardComments.data.length === 0) return null;

  return (
    <>
      <Separator />
      <div className="flex flex-col gap-6">
        {cardComments.data.map((comment) => (
          <CardDetailsCommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </>
  );
}
