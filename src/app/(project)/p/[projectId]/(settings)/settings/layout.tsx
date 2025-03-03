import { HydrateClient, trpc } from "~/trpc/server";

import { SettingsHeader } from "../_components/settings-header";
import { SettingsSidebar } from "../_components/settings-sidebar";
import { SettingsToolbar } from "../_components/settings-toolbar";

interface ProjectSettingsLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectSettingsLayout({
  children,
  params,
}: ProjectSettingsLayoutProps) {
  const { projectId } = await params;

  // Prefetch the project data
  await trpc.project.get.prefetch(projectId);

  // Get the project data
  const project = await trpc.project.get(projectId);

  return (
    <HydrateClient>
      <div className="flex h-[100dvh] w-full flex-col">
        <SettingsHeader projectId={projectId} projectName={project.name} />

        {/* Toolbar - responsive padding */}
        <div className="flex w-full border-y px-3 py-2 sm:px-4 md:px-6 lg:px-8">
          <SettingsToolbar projectId={projectId} />
        </div>

        {/* Main content - responsive layout that switches from column to row at medium breakpoint */}
        <main className="flex flex-1 flex-col overflow-auto md:flex-row">
          <SettingsSidebar projectId={projectId} />
          <div className="flex-1 overflow-y-auto px-3 pb-6 pt-4 sm:px-4 md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </HydrateClient>
  );
}
