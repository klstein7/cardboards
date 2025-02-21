import { FileText, LayoutGridIcon } from "lucide-react";
import Link from "next/link";

import { Card } from "~/components/ui/card";
import { useCardCountByBoardId, useColumns } from "~/lib/hooks";

import { type Board } from "../_types";

export function BoardItem({
  projectId,
  board,
}: {
  projectId: string;
  board: Board;
}) {
  const columns = useColumns(board.id);
  const cardCount = useCardCountByBoardId(board.id);

  return (
    <Link key={board.id} href={`/p/${projectId}/b/${board.id}`}>
      <Card
        className="group border-border/80 bg-secondary/20 shadow-lg transition-all duration-200 hover:border-[--board-color] hover:bg-secondary/30 hover:shadow-xl"
        style={{ "--board-color": board.color } as React.CSSProperties}
      >
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-[--board-color]">
                {board.name}
              </h3>
              <div className="bg-[--board-color]/20 h-1.5 w-24 rounded-full transition-all duration-300 group-hover:w-32">
                <div
                  className="h-full rounded-full bg-[--board-color] transition-all duration-300"
                  style={{
                    width: `${Math.min((columns.data?.length ?? 0 / 6) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="bg-[--board-color]/10 group-hover:bg-[--board-color]/20 rounded-full p-2 transition-colors">
              <LayoutGridIcon
                className="h-5 w-5"
                style={{ color: board.color }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-[--board-color]/10 group-hover:bg-[--board-color]/20 rounded-md p-2 transition-colors">
                  <LayoutGridIcon
                    className="h-5 w-5"
                    style={{ color: board.color }}
                  />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-foreground">
                    {columns.data?.length ?? 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Columns</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-[--board-color]/10 group-hover:bg-[--board-color]/20 rounded-md p-2 transition-colors">
                  <FileText
                    className="h-5 w-5"
                    style={{ color: board.color }}
                  />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-foreground">
                    {cardCount.data ?? 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Cards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
