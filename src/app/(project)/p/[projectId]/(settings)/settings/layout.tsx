import { api } from "~/server/api";

import { SettingsBreadcrumb } from "../_components/settings-breadcrumb";
import { SettingsSidebar } from "../_components/settings-sidebar";

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

  const project = await api.project.get(projectId);

  return (
    <div className="flex h-[100dvh] w-full max-w-7xl flex-col gap-6 p-6 pb-0 pr-0">
      <SettingsBreadcrumb projectId={projectId} projectName={project.name} />
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="flex h-full items-start gap-6 overflow-hidden rounded-t-lg bg-secondary/10 pl-6">
        <SettingsSidebar projectId={projectId} />
        <div className="scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-secondary/50 scrollbar-track-transparent flex h-full w-full flex-col gap-6 overflow-y-auto pt-6">
          {children}
        </div>
      </div>
    </div>
  );
}
