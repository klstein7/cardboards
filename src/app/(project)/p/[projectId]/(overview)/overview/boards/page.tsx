import { KanbanIcon, PlusIcon } from "lucide-react";

import { CreateBoardDialog } from "~/app/(project)/_components/create-board-dialog";
import { SectionHeader } from "~/components/shared/section-header";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
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
      <Card className="rounded-lg border bg-card shadow-sm">
        <SectionHeader
          title="Project Boards"
          icon={KanbanIcon}
          actions={
            <CreateBoardDialog
              trigger={
                <Button className="gap-1.5">
                  <PlusIcon className="h-4 w-4" />
                  <span>New Board</span>
                </Button>
              }
              projectId={projectId}
            />
          }
        />
        <CardContent className="p-4 pt-5 sm:p-6">
          <BoardList projectId={projectId} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
