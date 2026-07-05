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
    <TabsContent value="boards" className="mt-6">
      <BoardList projectId={projectId} />
    </TabsContent>
  );
}
