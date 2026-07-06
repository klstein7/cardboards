import { BoardList } from "./_components/board-list";

type Params = Promise<{ projectId: string }>;

export default async function ProjectBoardsPage({
  params,
}: {
  params: Params;
}) {
  const { projectId } = await params;

  return <BoardList projectId={projectId} />;
}
