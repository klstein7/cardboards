import { UserPlus } from "lucide-react";

import { CreateInvitationButton } from "~/app/(project)/_components/create-invitation-button";
import { TabsContent } from "~/components/ui/tabs";
import { HydrateClient, trpc } from "~/trpc/server";

import {
  columns,
  ProjectMembersDataTable,
} from "./_components/project-members-table";

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
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b p-4 sm:p-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {project.name} Team
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              View and manage team members and their roles
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreateInvitationButton />
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <HydrateClient>
            <ProjectMembersDataTable projectId={projectId} columns={columns} />
          </HydrateClient>
        </div>
      </div>
    </TabsContent>
  );
}
