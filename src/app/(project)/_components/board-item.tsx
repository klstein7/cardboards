import Link from "next/link";

import { Card } from "~/components/ui/card";

export function BoardItem({
  projectId,
  board,
}: {
  projectId: string;
  board: {
    id: string;
    name: string;
    color: string;
    columns: Array<{ id: string; name: string }>;
    _count?: { cards: number };
  };
}) {
  return (
    <Link key={board.id} href={`/p/${projectId}/b/${board.id}`}>
      <Card
        className="group h-full transition-all duration-300"
        style={
          {
            "--board-color": board.color,
            boxShadow: `0 4px 16px ${board.color}10`,
          } as React.CSSProperties
        }
      >
        <div className="flex h-full flex-col gap-6 p-6">
          <div className="h-2 w-16 rounded-full bg-[--board-color] transition-all duration-300 group-hover:w-24" />
          <div className="flex-1 space-y-6">
            <h3 className="text-xl font-medium tracking-tight transition-colors group-hover:text-[--board-color]">
              {board.name}
            </h3>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="group-hover:bg-[--board-color]/20 rounded-lg bg-muted/20 px-2.5 py-1 transition-colors group-hover:text-[--board-color]">
                  {board.columns.length} columns
                </span>
                <span className="group-hover:text-[--board-color]/30 text-muted-foreground/30 transition-colors">
                  •
                </span>
                <span className="group-hover:bg-[--board-color]/20 rounded-lg bg-muted/20 px-2.5 py-1 transition-colors group-hover:text-[--board-color]">
                  {board._count?.cards ?? 0} cards
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
