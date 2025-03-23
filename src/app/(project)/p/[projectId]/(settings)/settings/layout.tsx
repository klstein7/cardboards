import { HydrateClient, trpc } from "~/trpc/server";

import { SettingsSidebar } from "../_components/settings-sidebar";
import { SettingsToolbar } from "../_components/settings-toolbar";

type Params = Promise<{ projectId: string }>;

interface SettingsLayoutProps {
  children: React.ReactNode;
  params: Params;
}

export default async function SettingsLayout({
  children,
  params,
}: SettingsLayoutProps) {
  const { projectId } = await params;

  await trpc.project.get.prefetch(projectId);

  return (
    <HydrateClient>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex w-full shrink-0 border-b border-t px-4 py-3 sm:px-6 lg:px-8">
          <SettingsToolbar projectId={projectId} />
        </div>

        <div className="flex flex-1 overflow-hidden md:flex-row">
          <SettingsSidebar projectId={projectId} className="shrink-0" />
          <main className="flex-1 overflow-auto px-4 pb-6 pt-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </HydrateClient>
  );
}
