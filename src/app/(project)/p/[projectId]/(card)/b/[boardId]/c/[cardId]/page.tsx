import { notFound } from "next/navigation";

import { HydrateClient, trpc } from "~/trpc/server";

import { CardEditor } from "../../../../_components/card-editor";
import { CardToolbar } from "../../../../_components/card-toolbar";

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
      <div className="flex h-full w-full flex-col">
        <div className="flex w-full border-b border-t px-4 py-3 sm:px-6 lg:px-8">
          <CardToolbar cardId={Number(cardId)} />
        </div>
        <main className="flex-1 overflow-auto">
          <CardEditor cardId={Number(cardId)} />
        </main>
      </div>
    </HydrateClient>
  );
}
