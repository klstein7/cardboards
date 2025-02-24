import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { api } from "~/server/api";

import { ProjectSidebar } from "../../_components/project-sidebar";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const queryClient = new QueryClient();

  const { projectId } = await params;

  const boards = await api.board.list(projectId);

  await queryClient.prefetchQuery({
    queryKey: ["boards", projectId],
    queryFn: () => Promise.resolve(boards),
  });

  await queryClient.prefetchQuery({
    queryKey: ["project-users", projectId],
    queryFn: () => api.projectUser.list(projectId),
  });

  await Promise.all(
    boards.map((board) => {
      return Promise.all([
        queryClient.prefetchQuery({
          queryKey: ["columns", board.id],
          queryFn: () => api.column.list(board.id),
        }),
      ]);
    }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-[100dvh] w-full overflow-hidden">
        <ProjectSidebar projectId={projectId} />
        {children}
      </div>
    </HydrationBoundary>
  );
}
