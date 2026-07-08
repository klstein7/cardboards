import { BoardCommandStrip } from "../../_components/board-command-strip";

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
      <div className="w-full shrink-0 border-b">
        <BoardCommandStrip boardId={boardId} />
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
