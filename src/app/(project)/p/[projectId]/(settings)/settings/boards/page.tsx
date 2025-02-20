import { dehydrate, QueryClient } from "@tanstack/react-query";
import { HydrationBoundary } from "@tanstack/react-query";

import { api } from "~/server/api";

import { SettingsBoardList } from "../../_components/settings-board-list";

type Params = Promise<{ projectId: string }>;

export default async function ProjectSettingsBoardsPage({
  params,
}: {
  params: Params;
}) {
  const queryClient = new QueryClient();
  const { projectId } = await params;

  await queryClient.prefetchQuery({
    queryKey: ["boards", projectId],
    queryFn: () => api.board.list(projectId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-full flex-col gap-6">
        <h4 className="text-lg font-medium">Boards</h4>
        <div className="flex-1 pb-6">
          <SettingsBoardList projectId={projectId} />
        </div>
      </div>
    </HydrationBoundary>
  );
}
