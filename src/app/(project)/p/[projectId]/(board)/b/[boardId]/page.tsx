import { type Column } from "~/app/(project)/_types";
import { ColumnList } from "~/app/(project)/p/[projectId]/(board)/_components/column-list";
import { HydrateClient, trpc } from "~/trpc/server";

import { BoardRealtimeProvider } from "../../_components/board-realtime-provider";
import { BoardStateProvider } from "../../_components/board-state-provider";
import { CardDetails } from "../../_components/card-details";

type Params = Promise<{
  projectId: string;
  boardId: string;
}>;

export default async function BoardPage({ params }: { params: Params }) {
  const { projectId, boardId } = await params;

  // Prefetch all needed data
  await Promise.all([
    trpc.board.get.prefetch(boardId),
    trpc.column.list.prefetch(boardId),
    trpc.project.get.prefetch(projectId),
    trpc.projectUser.list.prefetch(projectId),
  ]);

  const columns = await trpc.column.list(boardId);

  // Prefetch cards for each column
  await Promise.all(
    columns.map((column: Column) => trpc.card.list.prefetch(column.id)),
  );

  return (
    <HydrateClient>
      <BoardRealtimeProvider>
        <BoardStateProvider>
          <div className="flex h-full w-full flex-col">
            <main className="relative flex-1 overflow-hidden">
              <ColumnList boardId={boardId} />
              <CardDetails />
            </main>
          </div>
        </BoardStateProvider>
      </BoardRealtimeProvider>
    </HydrateClient>
  );
}
