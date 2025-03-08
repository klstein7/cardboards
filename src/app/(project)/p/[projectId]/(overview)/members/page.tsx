import { FilePlus, Filter, Search, UserPlus } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
    <HydrateClient>
      <div className="space-y-6">
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
              <Button variant="outline" size="sm">
                <FilePlus className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search members..." className="pl-9" />
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            <ProjectMembersDataTable projectId={projectId} columns={columns} />
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
