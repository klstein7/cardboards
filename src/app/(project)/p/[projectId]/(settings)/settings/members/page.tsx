import {
  columns,
  ProjectMembersDataTable,
} from "~/app/(project)/_components/project-members-table";
import { HydrateClient } from "~/trpc/server";
import { trpc } from "~/trpc/server";

import { CreateInvitationButton } from "../../../../../_components/create-invitation-button";

type Params = Promise<{ projectId: string }>;

export default async function ProjectSettingsMembersPage({
  params,
}: {
  params: Params;
}) {
  const { projectId } = await params;

  await trpc.projectUser.list.prefetch(projectId);

  return (
    <HydrateClient>
      <div className="space-y-6">
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b p-4 sm:p-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Team Members
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your team and their access to the project
              </p>
            </div>
            <CreateInvitationButton />
          </div>

          <div className="p-4 sm:p-6">
            <ProjectMembersDataTable projectId={projectId} columns={columns} />
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
