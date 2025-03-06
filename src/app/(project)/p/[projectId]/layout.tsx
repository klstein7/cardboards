import { type ReactNode } from "react";

import { HydrateClient, trpc } from "~/trpc/server";

import { ProjectSidebar } from "../../_components/project-sidebar";
import { ProjectStats } from "../../_components/project-stats";
import { ProjectHeader } from "./_components/project-header";
import { ProjectToolbar } from "./_components/project-toolbar";

interface ProjectLayoutProps {
  children: ReactNode;
  params: {
    projectId: string;
  };
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { projectId } = params;

  // Get project data for header
  const project = await trpc.project.get(projectId);

  // Prefetch board data for sidebar
  await trpc.board.list.prefetch(projectId);

  return (
    <HydrateClient>
      <div className="flex h-[100dvh] w-full overflow-hidden">
        <ProjectSidebar projectId={projectId} />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <ProjectHeader projectName={project.name} />

          <div className="flex w-full border-b border-t px-4 py-3 sm:px-6 lg:px-8">
            <ProjectToolbar projectId={projectId} />
          </div>

          <main className="flex-1 overflow-auto px-4 pb-6 sm:px-6 lg:px-8">
            <div className="py-4">
              <ProjectStats projectId={projectId} />
            </div>

            <div className="mt-6">{children}</div>
          </main>
        </div>
      </div>
    </HydrateClient>
  );
}
