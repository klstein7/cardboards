import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { ColumnList } from "~/app/(project)/p/[projectId]/(board)/_components/column-list";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { api } from "~/server/api";

import { BoardFilters } from "../../_components/board-filters";
import { BoardStateProvider } from "../../_components/board-state-provider";
import { CardDetails } from "../../_components/card-details";
import { GenerateDropdownMenu } from "../../_components/generate-dropdown-menu";

interface BoardPageProps {
  params: Promise<{
    projectId: string;
    boardId: string;
  }>;
  searchParams: Promise<{
    search: string;
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
        <div className="flex h-[100dvh] w-full">
          <div className="flex w-full flex-col">
            <BreadcrumbList className="p-6">
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
            <div className="flex max-w-7xl justify-between px-6 pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{
                      backgroundColor: board.color,
                    }}
                  />
                  <h1 className="text-2xl font-bold">{board.name}</h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BoardFilters />
                <GenerateDropdownMenu boardId={boardId} />
              </div>
            </div>
            <ColumnList boardId={boardId} />
          </div>
        </div>
        <CardDetails />
      </BoardStateProvider>
    </HydrationBoundary>
  );
}
