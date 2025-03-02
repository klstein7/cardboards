import { Input } from "~/components/ui/input";
import { HydrateClient } from "~/trpc/server";
import { trpc } from "~/trpc/server";

import { CreateInvitationButton } from "../../_components/create-invitation-button";
import { ProjectUsersDataTable } from "../../_components/project-users-data-table/project-users-data-table";

type Params = Promise<{ projectId: string }>;

export default async function ProjectSettingsMembersPage({
  params,
}: {
  params: Params;
}) {
  const { projectId } = await params;

  // Prefetch the project users data
  await trpc.projectUser.list.prefetch(projectId);

  return (
    <HydrateClient>
      <div className="flex max-w-xl flex-col gap-6">
        <h4 className="text-lg font-medium">Members</h4>
        <div className="flex justify-between gap-6">
          <Input placeholder="Search" />
          <CreateInvitationButton />
        </div>
        <ProjectUsersDataTable projectId={projectId} />
      </div>
    </HydrateClient>
  );
}
