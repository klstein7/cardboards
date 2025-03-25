import { ArrowRight, Kanban } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { type Board } from "~/app/(project)/_types";
import { Card } from "~/components/ui/card";
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

  return (
    <Link href={`/p/${projectId}/b/${board.id}`}>
      <Card
        className={cn(
          "group flex h-full flex-col justify-between border-l-2 p-4 transition-all duration-200",
          "hover:bg-muted/30 hover:shadow-sm dark:hover:bg-blue-900/10",
          "dark:border-opacity-60 dark:bg-background/80 dark:shadow-sm",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ borderLeftColor: board.color }}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3
              className={cn(
                "truncate font-medium transition-colors",
                isHovered && "dark:text-blue-200",
              )}
              style={{ color: isHovered ? board.color : "inherit" }}
            >
              {board.name}
            </h3>

            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                isHovered
                  ? "bg-background dark:bg-blue-900/30"
                  : "bg-muted/40 dark:bg-blue-950/30",
              )}
              style={{ color: board.color }}
            >
              <Kanban className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            {columnsCount > 0
              ? `${columnsCount} ${columnsCount === 1 ? "column" : "columns"} · ${cardsCount} ${cardsCount === 1 ? "card" : "cards"}`
              : "No columns yet"}
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary/30 dark:bg-blue-950/40">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (columnsCount / 8) * 100)}%`,
                backgroundColor: board.color,
                opacity: isHovered ? 1 : 0.85,
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium transition-colors",
              isHovered
                ? "text-primary dark:text-blue-300"
                : "text-muted-foreground",
            )}
          >
            View
            <ArrowRight
              className={cn(
                "h-3 w-3 transition-transform",
                isHovered && "translate-x-0.5",
              )}
            />
          </span>
        </div>
      </Card>
    </Link>
  );
}
