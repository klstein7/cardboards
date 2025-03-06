import { redirect } from "next/navigation";

import { trpc } from "~/trpc/server";

interface ProjectPageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = params;

  // Verify the project exists before redirecting
  await trpc.project.get(projectId);

  // Redirect to the boards tab
  redirect(`/p/${projectId}/boards`);
}
