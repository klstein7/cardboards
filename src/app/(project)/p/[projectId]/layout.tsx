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

  void queryClient.prefetchQuery({
    queryKey: ["boards", projectId],
    queryFn: () => api.board.list(projectId),
  });

  void queryClient.prefetchQuery({
    queryKey: ["project-users", projectId],
    queryFn: () => api.projectUser.list(projectId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-[100dvh] w-full">
        <ProjectSidebar projectId={projectId} />
        {children}
      </div>
    </HydrationBoundary>
  );
}
