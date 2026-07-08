import { BoardRail } from "../../_components/board-rail";
import { BoardToolbar } from "../../_components/board-toolbar";

export default async function BoardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="flex w-full shrink-0 border-b px-4 py-4 sm:px-6 sm:py-5 xl:hidden">
        <BoardToolbar boardId={boardId} />
      </div>

      <div className="flex min-h-0 flex-1">
        <BoardRail boardId={boardId} />
        <div className="min-w-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
