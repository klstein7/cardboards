import { trpc } from "~/trpc/server";

import { ProjectActivity } from "../../_components/activity/project-activity";

interface ActivityPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { projectId } = await params;

  // Prefetch data
  await Promise.all([
    trpc.history.getByProject.prefetch({ projectId }),
    trpc.projectUser.list.prefetch(projectId),
  ]);

  return <ProjectActivity projectId={projectId} />;
}
