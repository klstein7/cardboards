import { ArrowRightIcon, CalendarIcon, KanbanIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { type Board } from "~/app/(project)/_types";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
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

  const progressPercentage = Math.min(100, (columnsCount / 8) * 100);

  // Determine the status color based on progress
  const getStatusColor = () => {
    if (progressPercentage < 30) return "bg-rose-500/50";
    if (progressPercentage < 70) return "bg-amber-500/50";
    return "bg-emerald-500/50";
  };

  return (
    <Link
      href={`/p/${projectId}/b/${board.id}`}
      className="group block h-full focus-visible:outline-none focus-visible:ring-1"
      style={
        {
          "--tw-ring-color": `${board.color}40`,
        } as React.CSSProperties
      }
      aria-label={`Open ${board.name} board`}
    >
      <Card
        className={cn(
          "relative flex h-full flex-col overflow-hidden border-border/60 bg-card shadow-sm transition-all duration-200",
          "hover:shadow-md",
        )}
        style={{
          borderColor: isHovered ? `${board.color}80` : undefined,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="pb-2 pt-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium tracking-tight text-foreground">
                {board.name}
              </h3>
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border/40 bg-secondary/30">
                <KanbanIcon
                  className="h-4 w-4"
                  style={{ color: board.color }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-primary/5 text-[10px] font-normal"
                style={{ borderColor: board.color + "40", color: board.color }}
              >
                Kanban
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarIcon className="h-3 w-3" />
                <span>
                  {new Date(board.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col pt-2">
          <div className="mb-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-medium text-foreground">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-secondary/50">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressPercentage}%`,
                  backgroundColor: board.color,
                }}
              />
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-3">
            <div className="flex flex-col rounded-md border border-border/40 p-3">
              <div className="flex items-center gap-2">
                <KanbanIcon
                  className="h-4 w-4"
                  style={{ color: board.color }}
                />
                <span className="text-sm font-medium">{columnsCount}</span>
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {columnsCount === 1 ? "Column" : "Columns"}
              </div>
            </div>

            <div className="flex flex-col rounded-md border border-border/40 p-3">
              <div className="flex items-center gap-2">
                <ArrowRightIcon
                  className="h-4 w-4"
                  style={{ color: board.color }}
                />
                <span className="text-sm font-medium">{cardsCount}</span>
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {cardsCount === 1 ? "Card" : "Cards"}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/20 p-3">
          <div className="flex w-full items-center justify-end">
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-medium text-muted-foreground",
                isHovered && "text-primary",
              )}
              style={isHovered ? { color: board.color } : {}}
            >
              Details
              <ArrowRightIcon
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  isHovered && "translate-x-0.5",
                )}
                style={isHovered ? { color: board.color } : {}}
              />
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
