import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Plus } from "lucide-react";

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { api } from "~/server/api";

import { BoardList } from "../../_components/board-list";
import { CreateBoardDialog } from "../../_components/create-board-dialog";
import { ProjectStats } from "../../_components/project-stats";

type Params = Promise<{ projectId: string }>;

export default async function ProjectPage({ params }: { params: Params }) {
  const queryClient = new QueryClient();

  const { projectId } = await params;

  const project = await api.project.get(projectId);
  const boards = await api.board.list(projectId);

  await queryClient.prefetchQuery({
    queryKey: ["project", projectId],
    queryFn: () => api.project.get(projectId),
  });

  await queryClient.prefetchQuery({
    queryKey: ["project-users", projectId],
    queryFn: () => api.projectUser.list(projectId),
  });

  await queryClient.prefetchQuery({
    queryKey: ["boards", projectId],
    queryFn: () => api.board.list(projectId),
  });

  await queryClient.prefetchQuery({
    queryKey: ["board-count-by-project-id", projectId],
    queryFn: () => api.board.countByProjectId(projectId),
  });

  await queryClient.prefetchQuery({
    queryKey: ["project-user-count-by-project-id", projectId],
    queryFn: () => api.projectUser.countByProjectId(projectId),
  });

  await queryClient.prefetchQuery({
    queryKey: ["card-count-by-project-id", projectId],
    queryFn: () => api.card.countByProjectId(projectId),
  });

  await Promise.all(
    boards.map((board) =>
      queryClient.prefetchQuery({
        queryKey: ["card-count-by-board-id", board.id],
        queryFn: () => api.card.countByBoardId(board.id),
      }),
    ),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-[100dvh] w-full">
        <div className="flex w-full max-w-7xl flex-col gap-6 px-6 pt-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>

          <div className="flex justify-between">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <CreateBoardDialog
              trigger={
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New board
                </Button>
              }
              projectId={projectId}
            />
          </div>
          <ProjectStats projectId={projectId} />
          <BoardList projectId={projectId} />
        </div>
      </div>
    </HydrationBoundary>
  );
}
