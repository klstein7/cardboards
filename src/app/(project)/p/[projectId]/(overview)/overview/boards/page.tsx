import { PlusIcon } from "lucide-react";

import { CreateBoardDialog } from "~/app/(project)/_components/create-board-dialog";
import { Button } from "~/components/ui/button";
import { TabsContent } from "~/components/ui/tabs";

import { BoardList } from "./_components/board-list";

type Params = Promise<{ projectId: string }>;

export default async function ProjectBoardsPage({
  params,
}: {
  params: Params;
}) {
  const { projectId } = await params;

  return (
    <TabsContent value="boards" className="space-y-4">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b p-4 sm:p-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Project Boards
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and organize your project boards
            </p>
          </div>
          <CreateBoardDialog
            trigger={
              <Button className="gap-1.5">
                <PlusIcon className="h-4 w-4" />
                <span>New Board</span>
              </Button>
            }
            projectId={projectId}
          />
        </div>

        <div className="p-4 pt-5 sm:p-6">
          <BoardList projectId={projectId} />
        </div>
      </div>
    </TabsContent>
  );
}
