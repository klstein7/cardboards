import { type Column } from "~/app/(project)/_types";
import { ColumnList } from "~/app/(project)/p/[projectId]/(board)/_components/column-list";
import { HydrateClient, trpc } from "~/trpc/server";

import { BoardStateProvider } from "../../_components/board-state-provider";
import { BoardToolbar } from "../../_components/board-toolbar";
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

  // Directly get the data since we need it for server rendering
  const board = await trpc.board.get(boardId);
  const columns = await trpc.column.list(boardId);

  // Prefetch cards for each column
  await Promise.all(
    columns.map((column: Column) => trpc.card.list.prefetch(column.id)),
  );

  return (
    <HydrateClient>
      <BoardStateProvider>
        <div className="flex h-full w-full flex-col">
          <div className="flex w-full border-y px-4 py-3 sm:px-6 lg:px-8">
            <BoardToolbar boardId={boardId} />
          </div>

          <main className="relative flex-1 overflow-auto px-4 pb-6 pt-3 sm:px-6 lg:px-8">
            <ColumnList boardId={boardId} />
            <CardDetails />
          </main>
        </div>
      </BoardStateProvider>
    </HydrateClient>
  );
}
