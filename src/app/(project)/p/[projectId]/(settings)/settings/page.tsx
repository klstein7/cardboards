import { trpc } from "~/trpc/server";

import { SettingsGeneralForm } from "../_components/settings-general-form";

type Params = Promise<{ projectId: string }>;

export default async function ProjectSettingsPage({
  params,
}: {
  params: Params;
}) {
  const { projectId } = await params;

  // Prefetch the project data
  await trpc.project.get.prefetch(projectId);

  // Get the project data
  const project = await trpc.project.get(projectId);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b p-4 sm:p-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              General Settings
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Basic information about your project
            </p>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <SettingsGeneralForm project={project} />
        </div>
      </div>
    </div>
  );
}
