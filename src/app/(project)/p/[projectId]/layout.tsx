import { HydrateClient, trpc } from "~/trpc/server";

import { DynamicHeader } from "../../_components/dynamic-header";
import { MobileNav } from "../../_components/mobile-nav";
import { ProjectSidebar } from "../../_components/project-sidebar";

type Params = Promise<{ projectId: string }>;

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Params;
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { projectId } = await params;

  // Prefetch all needed data
  await Promise.all([
    trpc.board.list.prefetch(projectId),
    trpc.projectUser.list.prefetch(projectId),
    trpc.project.get.prefetch(projectId),
  ]);

  // Get project and boards directly as we need them for further prefetching
  const [boards, project] = await Promise.all([
    trpc.board.list(projectId),
    trpc.project.get(projectId),
  ]);

  // Prefetch column data for each board
  await Promise.all(
    boards.map((board) => {
      return trpc.column.list.prefetch(board.id);
    }),
  );

  return (
    <HydrateClient>
      <div className="flex h-[100dvh] w-full overflow-hidden">
        <ProjectSidebar projectId={projectId} />
        <div className="min-w-0 flex-1 overflow-hidden sm:ml-[60px]">
          <MobileNav projectId={projectId} />
          <div className="flex h-full flex-col">
            <div className="sticky top-0 z-10 shadow-sm">
              <DynamicHeader projectId={projectId} projectName={project.name} />
            </div>
            <div className="flex-1 overflow-auto">{children}</div>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
