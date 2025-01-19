import { api } from "~/server/api";

import { SettingsBreadcrumb } from "../_components/settings-breadcrumb";

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
    <div className="flex w-full max-w-7xl flex-col gap-6 p-6">
      <SettingsBreadcrumb projectId={projectId} projectName={project.name} />
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="flex h-full items-start gap-6 rounded-lg bg-secondary/10 p-6">
        <div className="flex h-full w-full max-w-[200px] flex-col gap-3 border-r border-r-border/25">
          <p className="text-muted-foreground">General</p>
          <p className="text-muted-foreground">Members</p>
          <p className="text-muted-foreground">Boards</p>
        </div>
        <div className="flex h-full w-full flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}
