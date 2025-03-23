import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { DetailsMock } from "~/components/ui/sidebar";
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

  await Promise.all([
    trpc.board.list.prefetch(projectId),
    trpc.projectUser.list.prefetch(projectId),
    trpc.project.get.prefetch(projectId),
  ]);

  const [boards, project] = await Promise.all([
    trpc.board.list(projectId),
    trpc.project.get(projectId),
  ]);

  await Promise.all(
    boards.map((board) => {
      return trpc.column.list.prefetch(board.id);
    }),
  );

  return (
    <HydrateClient>
      <div className="flex h-[100dvh] w-full overflow-hidden">
        <ProjectSidebar projectId={projectId} />

        <div className="h-full flex-1 overflow-hidden sm:ml-[60px]">
          <div className="sticky top-0 z-10 w-full bg-background shadow-sm">
            <DynamicHeader projectId={projectId} projectName={project.name} />
          </div>
          <MobileNav projectId={projectId} />
          <div className="h-full overflow-auto">{children}</div>
        </div>
      </div>
    </HydrateClient>
  );
}
