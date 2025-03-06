import { trpc } from "~/trpc/server";

interface MembersPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { projectId } = await params;

  // Prefetch data
  await trpc.projectUser.countByProjectId.prefetch(projectId);

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="p-4 sm:p-6">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">
          Team Members
        </h2>
        <div className="text-muted-foreground">
          Member management features coming soon.
        </div>
      </div>
    </div>
  );
}
