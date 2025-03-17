import { UsersIcon } from "lucide-react";

import { CreateInvitationButton } from "~/app/(project)/_components/create-invitation-button";
import {
  columns,
  ProjectMembersDataTable,
} from "~/app/(project)/_components/project-members-table";
import { SectionHeader } from "~/components/shared/section-header";
import { Card, CardContent } from "~/components/ui/card";
import { TabsContent } from "~/components/ui/tabs";
import { HydrateClient, trpc } from "~/trpc/server";

type Params = Promise<{ projectId: string }>;

export default async function ProjectMembersPage({
  params,
}: {
  params: Params;
}) {
  const { projectId } = await params;

  // Prefetch the project users data
  await trpc.projectUser.list.prefetch(projectId);
  await trpc.project.get.prefetch(projectId);

  // Get project data for rendering
  const project = await trpc.project.get(projectId);

  return (
    <TabsContent value="members" className="space-y-6">
      <Card className="rounded-lg border bg-card shadow-sm">
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
    </TabsContent>
  );
}
