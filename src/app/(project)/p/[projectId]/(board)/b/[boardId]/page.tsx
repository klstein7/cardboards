import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { ColumnList } from "~/app/(project)/p/[projectId]/(board)/_components/column-list";
import { api } from "~/server/api";

import { BoardHeader } from "../../_components/board-header";
import { BoardStateProvider } from "../../_components/board-state-provider";
import { BoardToolbar } from "../../_components/board-toolbar";
import { CardDetails } from "../../_components/card-details";

type Params = Promise<{
  projectId: string;
  boardId: string;
}>;

export default async function BoardPage({ params }: { params: Params }) {
  const queryClient = new QueryClient();

  const { projectId, boardId } = await params;

  const board = await api.board.get(boardId);
  const columns = await api.column.list(boardId);
  const project = await api.project.get(projectId);
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["board", boardId],
      queryFn: () => Promise.resolve(board),
    }),

    queryClient.prefetchQuery({
      queryKey: ["project-users", projectId],
      queryFn: () => api.projectUser.list(projectId),
    }),

    queryClient.prefetchQuery({
      queryKey: ["columns", boardId],
      queryFn: () => Promise.resolve(columns),
    }),

    Promise.all(
      columns.map((column) => {
        return Promise.all([
          queryClient.prefetchQuery({
            queryKey: ["column", column.id],
            queryFn: () => Promise.resolve(column),
          }),
          queryClient.prefetchQuery({
            queryKey: ["cards", column.id],
            queryFn: () => api.card.list(column.id),
          }),
        ]);
      }),
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BoardStateProvider>
        <div className="flex h-[100dvh] w-full flex-col">
          <BoardHeader
            projectId={projectId}
            projectName={project.name}
            boardName={board.name}
            boardColor={board.color}
          />

          <div className="flex w-full border-y px-4 py-3 sm:px-6 lg:px-8">
            <BoardToolbar boardId={boardId} />
          </div>

          <main className="flex-1 overflow-hidden">
            <ColumnList boardId={boardId} />
          </main>
        </div>
        <CardDetails />
      </BoardStateProvider>
    </HydrationBoundary>
  );
}
