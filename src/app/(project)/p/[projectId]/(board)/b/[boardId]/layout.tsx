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
    <div className="relative flex h-full flex-col">
      <div className="flex w-full border-y px-4 py-3 sm:px-6">
        <BoardToolbar boardId={boardId} />
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div className="h-full overflow-auto">{children}</div>
      </div>
    </div>
  );
}
