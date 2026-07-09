"use client";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Columns3, Plus } from "lucide-react";
import { useEffect, useRef } from "react";

import {
  type Card,
  type CardDragData,
  type CardDropData,
  type Column,
  type ColumnDropData,
} from "~/app/(project)/_types";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useColumns, useMoveCard } from "~/lib/hooks";
import {
  getCardTargetMoveIndex,
  getColumnTargetMoveIndex,
  isCardMoveNoop,
} from "~/lib/hooks/card/card-move";
import { useIsAdmin } from "~/lib/hooks/project-user/use-is-admin";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/trpc/client";

import { useBoardState } from "./board-state-provider";
import { CardSkeleton } from "./card-skeleton";
import { ColumnItem } from "./column-item";
import { CreateColumnDialog } from "./create-column-dialog";

interface ColumnListProps {
  boardId: string;
}

interface LaneSizing {
  basis: string;
  grow: number;
}

type PanoramaLaneStyle = React.CSSProperties & {
  "--panorama-lane-basis": string;
  "--panorama-lane-grow": number;
};

export function ColumnList({ boardId }: ColumnListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const columns = useColumns(boardId);
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const { mutate: moveCard } = useMoveCard();
  const { settleCard } = useBoardState();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      event.preventDefault();
      const amount = Math.max(280, Math.min(420, element.clientWidth * 0.8));
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      element.scrollBy({
        left: event.key === "ArrowLeft" ? -amount : amount,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    };

    const cleanup = autoScrollForElements({ element });

    element.addEventListener("keydown", handleKeyDown);

    return () => {
      cleanup();
      element.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return source.data.type === "card";
      },
      onDrop({ location, source }) {
        const sourceData = source.data as unknown as CardDragData;
        const cardTarget = location.current.dropTargets.find(
          (target) => target.data.type === "card",
        );
        const columnTarget = location.current.dropTargets.find(
          (target) => target.data.type === "column",
        );

        if (!columnTarget) return;

        const columnData = columnTarget.data as unknown as ColumnDropData;
        const destinationColumnId = cardTarget
          ? (cardTarget.data as unknown as CardDropData).columnId
          : columnData.columnId;
        const destinationCards =
          queryClient.getQueryData<Card[]>(
            trpc.card.list.queryKey(destinationColumnId),
          ) ?? [];

        const newOrder = cardTarget
          ? getCardTargetMoveIndex({
              sourceIndex: sourceData.index,
              targetIndex: (cardTarget.data as unknown as CardDropData).index,
              sourceColumnId: sourceData.columnId,
              destinationColumnId,
              destinationCardCount: destinationCards.length,
              closestEdge: extractClosestEdge(cardTarget.data),
            })
          : getColumnTargetMoveIndex({
              sourceColumnId: sourceData.columnId,
              destinationColumnId,
              destinationCardCount: destinationCards.length,
            });

        if (
          isCardMoveNoop({
            sourceIndex: sourceData.index,
            newOrder,
            sourceColumnId: sourceData.columnId,
            destinationColumnId,
          })
        ) {
          return;
        }

        const destinationColumn = columns.data?.find(
          (column) => column.id === destinationColumnId,
        );

        settleCard(
          sourceData.payload.id,
          `Moved ${sourceData.payload.title} to ${destinationColumn?.name ?? "column"}, position ${newOrder + 1}.`,
        );
        moveCard({
          cardId: sourceData.payload.id,
          sourceColumnId: sourceData.columnId,
          destinationColumnId,
          newOrder,
        });
      },
    });
  }, [columns.data, moveCard, queryClient, settleCard, trpc.card.list]);

  if (columns.isError) {
    return (
      <div className="h-full p-4 md:p-6">
        <div className="flex min-h-48 flex-col items-start justify-end border border-dashed border-border p-6">
          <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden />
          <h2 className="mt-5 text-xl font-light tracking-tight">
            The board could not load
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {columns.error.message}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-5"
            onClick={() => void columns.refetch()}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (columns.isPending) {
    return <ColumnListLoading />;
  }

  const orderedColumns = [...columns.data].sort((a, b) => a.order - b.order);

  if (orderedColumns.length === 0) {
    return (
      <div className="h-full p-4 md:p-6">
        <div className="flex min-h-64 flex-col items-start justify-end border border-dashed border-border p-6">
          <Columns3 className="h-5 w-5 text-muted-foreground" aria-hidden />
          <h2 className="mt-5 text-xl font-light tracking-tight">
            Build the first lane
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {isAdmin
              ? "Add a column to give this board its first stage."
              : "An admin needs to add the first column to this board."}
          </p>
          {isAdmin && (
            <CreateColumnDialog
              boardId={boardId}
              trigger={
                <Button variant="outline" size="sm" className="mt-5">
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Add column
                </Button>
              }
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain sm:snap-none",
        "scrollbar-none sm:scrollbar-thin sm:scrollbar-track-transparent",
        "sm:scrollbar-thumb-border sm:hover:scrollbar-thumb-foreground/25",
      )}
      role="region"
      aria-label="Board lanes"
      tabIndex={0}
    >
      <div className="flex h-full min-w-full divide-x divide-border">
        {orderedColumns.map((column, index) => {
          const sizing = getPanoramaLaneSizing(column, index);

          return (
            <PanoramaLaneFrame
              key={column.id}
              id={`board-column-${column.id}`}
              sizing={sizing}
            >
              <ColumnItem column={column} />
            </PanoramaLaneFrame>
          );
        })}
      </div>
    </div>
  );
}

function getPanoramaLaneSizing(column: Column, index: number): LaneSizing {
  if (column.isCompleted) return { basis: "230px", grow: 0.82 };
  if (index === 0) return { basis: "300px", grow: 1.16 };
  if (index === 1) return { basis: "290px", grow: 1.08 };
  return { basis: "260px", grow: 0.94 };
}

function PanoramaLaneFrame({
  children,
  className,
  id,
  sizing,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  sizing: LaneSizing;
}) {
  const style: PanoramaLaneStyle = {
    "--panorama-lane-basis": sizing.basis,
    "--panorama-lane-grow": sizing.grow,
  };

  return (
    <div
      id={id}
      style={style}
      className={cn(
        "min-w-0 flex-[0_0_calc(100vw-8px)] snap-start sm:flex-[var(--panorama-lane-grow)_0_var(--panorama-lane-basis)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ColumnListLoading() {
  const lanes: LaneSizing[] = [
    { basis: "300px", grow: 1.16 },
    { basis: "290px", grow: 1.08 },
    { basis: "260px", grow: 0.94 },
    { basis: "230px", grow: 0.82 },
  ];

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="flex h-full min-w-full divide-x divide-border">
        {lanes.map((sizing, columnIndex) => (
          <PanoramaLaneFrame key={columnIndex} sizing={sizing}>
            <div className="flex h-full min-w-0 flex-col">
              <div className="flex h-11 items-center justify-between border-b border-border px-3.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-5" />
              </div>
              <div className="flex-1 divide-y divide-border/60 overflow-hidden">
                {Array.from({ length: 2 + (columnIndex % 2) }).map(
                  (_, cardIndex) => (
                    <CardSkeleton key={cardIndex} />
                  ),
                )}
              </div>
            </div>
          </PanoramaLaneFrame>
        ))}
      </div>
    </div>
  );
}
