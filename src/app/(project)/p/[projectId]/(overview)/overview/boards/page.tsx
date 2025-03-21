import { KanbanIcon } from "lucide-react";

import { SectionHeader } from "~/components/shared/section-header";
import { Card, CardContent } from "~/components/ui/card";
import { TabsContent } from "~/components/ui/tabs";

import { AdminCreateBoardButton } from "./_components/admin-create-board-button";
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
          actions={<AdminCreateBoardButton projectId={projectId} />}
        />
        <CardContent className="p-4 pt-5 sm:p-6">
          <BoardList projectId={projectId} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
