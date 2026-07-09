"use client";

import { useQueries } from "@tanstack/react-query";

import { Skeleton } from "~/components/ui/skeleton";
import { useBoardSafe, useColumns } from "~/lib/hooks";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/trpc/client";

import { BoardLabelFilter } from "./board-filters";

export function BoardPanoramaHeader({ boardId }: { boardId: string }) {
  const board = useBoardSafe(boardId);
  const columns = useColumns(boardId);
  const trpc = useTRPC();

  const orderedColumns = [...(columns.data ?? [])].sort(
    (a, b) => a.order - b.order,
  );

  const cardQueries = useQueries({
    queries: orderedColumns.map((column) =>
      trpc.card.list.queryOptions(column.id),
    ),
  });

  const totalCards = cardQueries.reduce(
    (total, query) => total + (query.data?.length ?? 0),
    0,
  );
  const doneCards = orderedColumns.reduce(
    (total, column, index) =>
      total +
      (column.isCompleted ? (cardQueries[index]?.data?.length ?? 0) : 0),
    0,
  );
  const donePercent =
    totalCards > 0 ? Math.round((doneCards / totalCards) * 100) : 0;

  if (board.isPending) {
    return <BoardPanoramaHeaderSkeleton />;
  }

  return (
    <section
      aria-labelledby="board-panorama-title"
      className="shrink-0 border-b border-border px-4 py-4 md:px-6 md:py-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1
          id="board-panorama-title"
          className="min-w-0 truncate text-3xl font-light tracking-[-0.025em]"
        >
          {board.data?.name ?? "Board"}
        </h1>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:justify-end">
          <div className="flex items-center gap-4 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <span>
              {totalCards} {totalCards === 1 ? "card" : "cards"}
            </span>
            <span>{doneCards} done</span>
            <span className="text-primary">{donePercent}%</span>
          </div>

          {orderedColumns.length > 0 && (
            <div
              className="grid w-28 gap-1"
              style={{
                gridTemplateColumns: `repeat(${orderedColumns.length}, minmax(0, 1fr))`,
              }}
              role="img"
              aria-label={`${orderedColumns.filter((column) => column.isCompleted).length} of ${orderedColumns.length} stages marked complete`}
            >
              {orderedColumns.map((column) => (
                <span
                  key={column.id}
                  className={cn(
                    "h-px",
                    column.isCompleted ? "bg-primary" : "bg-border",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BoardLabelFilter className="mt-4 flex-nowrap overflow-x-auto pb-1 md:hidden" />
    </section>
  );
}

export function BoardPanoramaHeaderSkeleton() {
  return (
    <div className="shrink-0 border-b border-border px-4 py-4 md:px-6 md:py-5">
      <div className="flex items-end justify-between gap-6">
        <Skeleton className="h-8 w-56 max-w-[45vw]" />
        <div className="hidden items-center gap-4 sm:flex">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-px w-28" />
        </div>
      </div>
    </div>
  );
}
