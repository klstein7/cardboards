import { notFound } from "next/navigation";

import { HydrateClient, trpc } from "~/trpc/server";

import { CardEditor } from "./card-editor";

type Params = Promise<{
  projectId: string;
  boardId: string;
  cardId: string;
}>;

export default async function CardPage({ params }: { params: Params }) {
  const { cardId, boardId, projectId } = await params;

  if (!cardId || isNaN(Number(cardId))) {
    return notFound();
  }

  await Promise.all([
    trpc.card.get.prefetch(Number(cardId)),
    trpc.board.get.prefetch(boardId),
    trpc.project.get.prefetch(projectId),
    trpc.projectUser.list.prefetch(projectId),
    trpc.cardComment.list.prefetch(Number(cardId)),
  ]);

  return (
    <HydrateClient>
      <CardEditor cardId={Number(cardId)} />
    </HydrateClient>
  );
}
