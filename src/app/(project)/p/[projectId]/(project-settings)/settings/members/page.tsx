import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { api } from "~/server/api";

import { ProjectUsersDataTable } from "../../_components/project-users-data-table/project-users-data-table";

interface ProjectSettingsMembersPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectSettingsMembersPage({
  params,
}: ProjectSettingsMembersPageProps) {
  const queryClient = new QueryClient();

  const { projectId } = await params;

  await queryClient.prefetchQuery({
    queryKey: ["project-users", projectId],
    queryFn: () => api.projectUser.list(projectId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-6">
        <h4 className="text-lg font-medium">Members</h4>
        <ProjectUsersDataTable projectId={projectId} />
      </div>
    </HydrationBoundary>
  );
}
