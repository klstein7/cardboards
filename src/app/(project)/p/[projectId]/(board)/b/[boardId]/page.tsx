import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";

import { ColumnList } from "~/app/(project)/p/[projectId]/(board)/_components/column-list";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { api } from "~/server/api";

import { BoardFilters } from "../../_components/board-filters";
import { BoardStateProvider } from "../../_components/board-state-provider";
import { CardDetails } from "../../_components/card-details";
import { CreateCardDialog } from "../../_components/create-card-dialog";

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
      queryFn: () =>
        Promise.resolve(columns.map(({ cards, ...column }) => column)),
    }),

    Promise.all(
      columns.map(({ cards, ...column }) => {
        return Promise.all([
          queryClient.prefetchQuery({
            queryKey: ["column", column.id],
            queryFn: () => Promise.resolve(column),
          }),
          queryClient.prefetchQuery({
            queryKey: ["cards", column.id],
            queryFn: () =>
              Promise.resolve(cards.map(({ comments, ...card }) => card)),
          }),
          ...cards.map(({ comments, ...card }) =>
            queryClient.prefetchQuery({
              queryKey: ["card-comments", card.id],
              queryFn: () => Promise.resolve(comments),
            }),
          ),
        ]);
      }),
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BoardStateProvider>
        <div className="flex grow">
          <div className="flex w-full max-w-7xl flex-col gap-6 p-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/projects`}>Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/p/${projectId}`}>
                  {project.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/p/${projectId}/boards`}>
                  Boards
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{board.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{board.name}</h1>
              <BoardFilters />
            </div>
            <ColumnList boardId={boardId} />
          </div>
        </div>
        <CardDetails />
      </BoardStateProvider>
    </HydrationBoundary>
  );
}
