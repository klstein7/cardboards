import { ProjectStats } from "~/app/(project)/p/[projectId]/(overview)/_components/project-stats";
import { ProjectTabs } from "~/app/(project)/p/[projectId]/(overview)/_components/project-tabs";
import { HydrateClient, trpc } from "~/trpc/server";

import { ProjectHeader } from "./_components/project-header";
import { ProjectToolbar } from "./_components/project-toolbar";

type Params = Promise<{ projectId: string }>;

interface ProjectOverviewLayoutProps {
  children: React.ReactNode;
  params: Params;
}

export default async function ProjectOverviewLayout({
  children,
  params,
}: ProjectOverviewLayoutProps) {
  const { projectId } = await params;

  await Promise.all([
    trpc.project.get.prefetch(projectId),
    trpc.board.list.prefetch(projectId),
    trpc.projectUser.list.prefetch(projectId),
    trpc.history.getByProject.prefetch({ projectId }),
    trpc.board.countByProjectId.prefetch(projectId),
    trpc.projectUser.countByProjectId.prefetch(projectId),
    trpc.card.countByProjectId.prefetch(projectId),
  ]);

  const project = await trpc.project.get(projectId);
  const boards = await trpc.board.list(projectId);

  await Promise.all(
    boards.map((board) => trpc.card.countByBoardId.prefetch(board.id)),
  );

  return (
    <HydrateClient>
      <div className="flex h-[100dvh] w-full flex-col">
        <ProjectHeader projectName={project.name} />

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
