import { Search } from "lucide-react";

import { Input } from "~/components/ui/input";
import { HydrateClient } from "~/trpc/server";
import { trpc } from "~/trpc/server";

import { CreateInvitationButton } from "../../../../../_components/create-invitation-button";
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
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search members..." className="pl-9" />
              </div>
            </div>
            <ProjectUsersDataTable projectId={projectId} />
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
