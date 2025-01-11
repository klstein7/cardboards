import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { ColumnList } from "~/app/(project)/p/[projectId]/(board)/_components/column-list";
import { api } from "~/server/api";

import { BoardStateProvider } from "../../_components/board-state-provider";

interface BoardPageProps {
  params: Promise<{
    projectId: string;
    boardId: string;
  }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const queryClient = new QueryClient();

  const { projectId, boardId } = await params;

  const { columns, ...board } = await api.board.get(boardId);

  void queryClient.prefetchQuery({
    queryKey: ["board", boardId],
    queryFn: () => Promise.resolve(board),
  });

  void queryClient.prefetchQuery({
    queryKey: ["project-users", projectId],
    queryFn: () => api.projectUser.list(projectId),
  });

  void queryClient.prefetchQuery({
    queryKey: ["columns", boardId],
    queryFn: () =>
      Promise.resolve(columns.map(({ cards, ...column }) => column)),
  });

  await Promise.all(
    columns.map(({ cards, ...column }) => {
      void queryClient.prefetchQuery({
        queryKey: ["column", column.id],
        queryFn: () => Promise.resolve(column),
      });
      void queryClient.prefetchQuery({
        queryKey: ["cards", column.id],
        queryFn: () => Promise.resolve(cards),
      });
    }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BoardStateProvider>
        <div className="flex grow">
          <div className="flex w-full max-w-7xl flex-col gap-6 p-6">
            <ColumnList boardId={boardId} />
          </div>
        </div>
      </BoardStateProvider>
    </HydrationBoundary>
  );
}
