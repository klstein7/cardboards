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
      <div className="flex w-full shrink-0 border-y px-4 py-3 sm:px-6">
        <BoardToolbar boardId={boardId} />
      </div>

      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
