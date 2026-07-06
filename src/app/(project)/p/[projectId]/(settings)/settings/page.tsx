import { trpc } from "~/trpc/server";

import { SettingsGeneralForm } from "../_components/settings-general-form";

type Params = Promise<{ projectId: string }>;

export default async function ProjectSettingsPage({
  params,
}: {
  params: Params;
}) {
  const { projectId } = await params;

  await trpc.project.get.prefetch(projectId);

  const project = await trpc.project.get(projectId);

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-5">
        <h2 className="text-2xl font-light tracking-tight">General</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Basic information about your project
        </p>
      </div>
      <SettingsGeneralForm project={project} />
    </div>
  );
}
