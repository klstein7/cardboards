import { HydrateClient, trpc } from "~/trpc/server";

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
  ]);

  // Get boards directly as we need them for further prefetching
  const boards = await trpc.board.list(projectId);

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
        <div className="min-w-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </HydrateClient>
  );
}
