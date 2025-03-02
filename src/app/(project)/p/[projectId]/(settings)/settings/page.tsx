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
    <div className="flex flex-col gap-6">
      <h4 className="text-lg font-medium">General</h4>
      <SettingsGeneralForm project={project} />
    </div>
  );
}
