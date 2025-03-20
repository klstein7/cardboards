import { HydrateClient, trpc } from "~/trpc/server";

import { ProjectStats } from "./_components/project-stats";
import { ProjectTabs } from "./_components/project-tabs";
import { ProjectToolbar } from "./_components/project-toolbar";

type Params = Promise<{ projectId: string }>;

interface OverviewLayoutProps {
  children: React.ReactNode;
  params: Params;
}

export default async function OverviewLayout({
  children,
  params,
}: OverviewLayoutProps) {
  const { projectId } = await params;

  await Promise.all([
    trpc.board.list.prefetch(projectId),
    trpc.project.get.prefetch(projectId),
    trpc.projectUser.list.prefetch(projectId),
    trpc.history.getByProjectPaginated.prefetch({ projectId }),
    trpc.board.countByProjectId.prefetch(projectId),
    trpc.projectUser.countByProjectId.prefetch(projectId),
    trpc.card.countByProjectId.prefetch(projectId),
  ]);

  return (
    <HydrateClient>
      <div className="flex h-full w-full flex-col">
        <div className="flex w-full border-b border-t px-4 py-3 sm:px-6 lg:px-8">
          <ProjectToolbar projectId={projectId} />
        </div>

        <main className="flex-1 overflow-auto px-4 pb-6 sm:px-6 lg:px-8">
          <div className="py-4">
            <ProjectStats projectId={projectId} />
          </div>

          <div className="mt-6">
            <ProjectTabs projectId={projectId}>{children}</ProjectTabs>
          </div>
        </main>
      </div>
    </HydrateClient>
  );
}
