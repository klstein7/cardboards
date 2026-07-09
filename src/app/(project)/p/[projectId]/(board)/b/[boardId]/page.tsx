import { type Column } from "~/app/(project)/_types";
import { ColumnList } from "~/app/(project)/p/[projectId]/(board)/_components/column-list";
import { HydrateClient, trpc } from "~/trpc/server";

import { BoardPanoramaHeader } from "../../_components/board-panorama-header";
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
          <div className="flex h-full w-full">
            <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
              <BoardPanoramaHeader boardId={boardId} />
              <div className="min-h-0 flex-1">
                <ColumnList boardId={boardId} />
              </div>
            </main>
            <CardDetails boardId={boardId} />
          </div>
        </BoardStateProvider>
      </BoardRealtimeProvider>
    </HydrateClient>
  );
}
