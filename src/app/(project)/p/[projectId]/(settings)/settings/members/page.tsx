import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { Input } from "~/components/ui/input";
import { api } from "~/server/api";

import { CreateInvitationButton } from "../../_components/create-invitation-button";
import { ProjectUsersDataTable } from "../../_components/project-users-data-table/project-users-data-table";

type Params = Promise<{ projectId: string }>;

export default async function ProjectSettingsMembersPage({
  params,
}: {
  params: Params;
}) {
  const queryClient = new QueryClient();

  const { projectId } = await params;

  await queryClient.prefetchQuery({
    queryKey: ["project-users", projectId],
    queryFn: () => api.projectUser.list(projectId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex max-w-xl flex-col gap-6">
        <h4 className="text-lg font-medium">Members</h4>
        <div className="flex justify-between gap-6">
          <Input placeholder="Search" />
          <CreateInvitationButton />
        </div>
        <ProjectUsersDataTable projectId={projectId} />
      </div>
    </HydrationBoundary>
  );
}
