import { CreateInvitationButton } from "~/app/(project)/_components/create-invitation-button";
import {
  columns,
  ProjectMembersDataTable,
} from "~/app/(project)/_components/project-members-table";
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-light tracking-tight">Members</h2>
        <CreateInvitationButton />
      </div>
      <HydrateClient>
        <ProjectMembersDataTable projectId={projectId} columns={columns} />
      </HydrateClient>
    </div>
  );
}
