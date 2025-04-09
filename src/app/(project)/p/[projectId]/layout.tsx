import { HydrateClient, trpc } from "~/trpc/server";

import { FloatingActionMenu } from "../../_components/floating-action-menu";
import { ProjectClientLayout } from "../../_components/project-client-layout";

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
      <ProjectClientLayout projectId={projectId} project={project}>
        {children}
      </ProjectClientLayout>
      <FloatingActionMenu entityType="project" entityId={projectId} />
    </HydrateClient>
  );
}
