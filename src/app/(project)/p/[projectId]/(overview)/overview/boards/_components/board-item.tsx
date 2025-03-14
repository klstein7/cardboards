import { ArrowRight, FileText, Kanban, LayoutGridIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { type Board } from "~/app/(project)/_types";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { useCardCountByBoardId, useColumns } from "~/lib/hooks";
import { cn } from "~/lib/utils";

export function BoardItem({
  projectId,
  board,
}: {
  projectId: string;
  board: Board;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const columns = useColumns(board.id);
  const cardCount = useCardCountByBoardId(board.id);

  const columnsCount = columns.data?.length ?? 0;
  const cardsCount = cardCount.data ?? 0;

  const progressPercentage =
    columnsCount > 0
      ? Math.min(
          100,
          (columnsCount / Math.max(1, Math.min(8, columnsCount + 2))) * 100,
        )
      : 0;

  return (
    <Link href={`/p/${projectId}/b/${board.id}`}>
      <Card
        className="group h-full overflow-hidden border transition-all duration-300 hover:border-primary/40 hover:shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={
          {
            "--board-color": board.color,
            borderColor: isHovered ? board.color : undefined,
          } as React.CSSProperties
        }
      >
        <div className="relative">
          <div
            className="absolute inset-x-0 top-0 h-1 transition-colors"
            style={{ backgroundColor: board.color }}
          />

          <CardContent className="p-6 pt-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3
                  className="text-xl font-semibold tracking-tight transition-colors"
                  style={{ color: isHovered ? board.color : "inherit" }}
                >
                  {board.name}
                </h3>
                <div className="mt-1.5 text-sm text-muted-foreground">
                  {columnsCount > 0
                    ? `${columnsCount} ${columnsCount === 1 ? "column" : "columns"}`
                    : "No columns yet"}
                </div>
              </div>

              <div
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                style={{
                  backgroundColor: `${board.color}20`,
                  color: board.color,
                }}
              >
                <LayoutGridIcon className="h-5 w-5" />
              </div>
            </div>

            <div className="mb-6 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium" style={{ color: board.color }}>
                  {progressPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercentage}%`,
                    backgroundColor: board.color,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="flex items-center gap-2">
                  <div
                    className="rounded-md p-1.5"
                    style={{ backgroundColor: `${board.color}20` }}
                  >
                    <Kanban
                      className="h-4 w-4"
                      style={{ color: board.color }}
                    />
                  </div>
                  <div className="text-sm font-medium">{columnsCount}</div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Columns
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 p-3">
                <div className="flex items-center gap-2">
                  <div
                    className="rounded-md p-1.5"
                    style={{ backgroundColor: `${board.color}20` }}
                  >
                    <FileText
                      className="h-4 w-4"
                      style={{ color: board.color }}
                    />
                  </div>
                  <div className="text-sm font-medium">{cardsCount}</div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Cards</div>
              </div>
            </div>
          </CardContent>

          <CardFooter
            className={cn(
              "bg-muted/30 p-3 transition-colors",
              isHovered && "bg-muted/50",
            )}
          >
            <div className="flex w-full items-center justify-end">
              <span
                className="flex items-center gap-1 text-xs font-medium transition-colors"
                style={{ color: isHovered ? board.color : undefined }}
              >
                View board
                <ArrowRight
                  className={cn(
                    "h-3 w-3 transition-transform",
                    isHovered && "translate-x-0.5",
                  )}
                />
              </span>
            </div>
          </CardFooter>
        </div>
      </Card>
    </Link>
  );
}
