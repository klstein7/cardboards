"use client";

import { Separator } from "~/components/ui/separator";
import { useCardComments } from "~/lib/hooks";

import { CardDetailsCommentItem } from "./card-details-comment-item";

export function CardDetailsCommentList({ cardId }: { cardId: number }) {
  const cardComments = useCardComments(cardId);

  if (cardComments.isError) throw cardComments.error;

  if (cardComments.isPending) return <div>Loading...</div>;

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
