import { ArrowRightIcon, CalendarIcon, KanbanIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { type Board } from "~/app/(project)/_types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import {
  useCardCountByBoardId,
  useColumns,
  useCompletedCardCountByBoardId,
} from "~/lib/hooks";
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
  const completedCardCount = useCompletedCardCountByBoardId(board.id);

  const columnsCount = columns.data?.length ?? 0;
  const cardsCount = cardCount.data ?? 0;
  const completedCardsCount = completedCardCount.data ?? 0;

  // Check if data is still loading
  const isLoading = cardCount.isPending || completedCardCount.isPending;

  const progressPercentage =
    cardsCount > 0
      ? Math.min(100, Math.round((completedCardsCount / cardsCount) * 100))
      : 0;

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
            </div>
            <div className="flex items-center gap-2">
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
                {isLoading ? (
                  <span className="inline-block h-4 w-8 animate-pulse rounded bg-muted"></span>
                ) : (
                  `${progressPercentage}%`
                )}
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-secondary/50">
              {isLoading ? (
                <div className="h-full w-full animate-pulse bg-muted/70"></div>
              ) : (
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progressPercentage}%`,
                    backgroundColor: board.color,
                  }}
                />
              )}
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
                <span className="text-sm font-medium">
                  {isLoading ? (
                    <span className="inline-block h-4 w-4 animate-pulse rounded bg-muted"></span>
                  ) : (
                    cardsCount
                  )}
                </span>
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
