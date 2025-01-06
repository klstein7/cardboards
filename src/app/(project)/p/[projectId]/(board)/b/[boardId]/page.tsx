import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ColumnList } from "~/app/(project)/_components/column-list";
import { api } from "~/server/api";

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

  await queryClient.prefetchQuery({
    queryKey: ["board", boardId],
    queryFn: () => Promise.resolve(board),
  });

  await queryClient.prefetchQuery({
    queryKey: ["columns", boardId],
    queryFn: () => Promise.resolve(columns),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex grow">
        <div className="flex w-full max-w-7xl flex-col gap-6 p-6">
          <ColumnList boardId={boardId} />
        </div>
      </div>
    </HydrationBoundary>
  );
}
