import { HydrateClient, trpc } from "~/trpc/server";

import { SettingsBoardList } from "../../_components/settings-board-list";

type Params = Promise<{ projectId: string }>;

export default async function ProjectSettingsBoardsPage({
  params,
}: {
  params: Params;
}) {
  const { projectId } = await params;

  // Prefetch the boards data
  await trpc.board.list.prefetch(projectId);

  return (
    <HydrateClient>
      <div className="flex h-full flex-col gap-6">
        <h4 className="text-lg font-medium">Boards</h4>
        <div className="flex-1 pb-6">
          <SettingsBoardList projectId={projectId} />
        </div>
      </div>
    </HydrateClient>
  );
}
