import { UsersIcon } from "lucide-react";

import { CreateInvitationButton } from "~/app/(project)/_components/create-invitation-button";
import {
  columns,
  ProjectMembersDataTable,
} from "~/app/(project)/_components/project-members-table";
import { SectionHeader } from "~/components/shared/section-header";
import { Card, CardContent } from "~/components/ui/card";
import { HydrateClient, trpc } from "~/trpc/server";

type Params = Promise<{ projectId: string }>;

export default async function ProjectMembersPage({
  params,
}: {
  params: Params;
}) {
  const { projectId } = await params;

  await trpc.projectUser.list.prefetch(projectId);
  await trpc.project.get.prefetch(projectId);

  return (
    <div className="space-y-6">
      <Card className="border bg-card">
        <SectionHeader
          title="Project Members"
          icon={UsersIcon}
          actions={<CreateInvitationButton />}
        />
        <CardContent className="p-4 sm:p-6">
          <HydrateClient>
            <ProjectMembersDataTable projectId={projectId} columns={columns} />
          </HydrateClient>
        </CardContent>
      </Card>
    </div>
  );
}
