import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Filter } from "lucide-react";

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
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="px-4 sm:px-6 lg:px-8">
              <BreadcrumbList className="py-4">
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
                  <BreadcrumbPage>{board.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </div>

            <div className="flex w-full items-center justify-between border-t px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="h-4 w-4 flex-shrink-0 rounded-full"
                  style={{
                    backgroundColor: board.color,
                  }}
                />
                <h1 className="truncate text-xl font-bold">{board.name}</h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block">
                  <BoardFilters />
                </div>
                <div className="flex-shrink-0">
                  <GenerateDropdownMenu boardId={boardId} />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-hidden">
            <ColumnList boardId={boardId} />
          </main>
        </div>
        <CardDetails />
      </BoardStateProvider>
    </HydrationBoundary>
  );
}
