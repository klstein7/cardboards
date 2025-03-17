import { Plus, Search } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { HydrateClient, trpc } from "~/trpc/server";

import { SettingsBoardList } from "../../_components/settings-board-list";

type Params = Promise<{ projectId: string }>;

export default async function ProjectSettingsBoardsPage({
  params,
}: {
  params: Params;
}) {
  const { projectId } = await params;

  await trpc.board.list.prefetch(projectId);

  return (
    <HydrateClient>
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 md:p-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                Project Boards
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage all boards in this project
              </p>
            </div>
            <Button className="sm:ml-auto" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Board
            </Button>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search boards..." className="pl-9" />
              </div>
            </div>
            <div className="flex-1">
              <SettingsBoardList projectId={projectId} />
            </div>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
