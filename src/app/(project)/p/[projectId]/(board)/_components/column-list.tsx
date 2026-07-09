"use client";

import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { useEffect, useRef } from "react";

import { useColumns } from "~/lib/hooks";
import { cn } from "~/lib/utils";

import { ColumnItem } from "./column-item";

interface ColumnListProps {
  boardId: string;
}

export function ColumnList({ boardId }: ColumnListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const columns = useColumns(boardId);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        element.scrollBy({ left: -350, behavior: "smooth" });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        element.scrollBy({ left: 350, behavior: "smooth" });
      }
    };

    const cleanup = autoScrollForElements({
      element,
    });

    element.addEventListener("keydown", handleKeyDown);

    return () => {
      cleanup();
      element.removeEventListener("keydown", handleKeyDown);
    };
  }, [columns.data]);

  if (columns.isError) {
    return <div>Error: {columns.error.message}</div>;
  }

  if (columns.isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading columns...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "h-full w-full overflow-x-auto",
        "scrollbar-none sm:scrollbar-thin sm:scrollbar-track-transparent",
        "sm:scrollbar-thumb-border sm:hover:scrollbar-thumb-foreground/25",
      )}
      tabIndex={0}
    >
      <div className="grid h-full auto-cols-[calc(100vw-8px)] grid-flow-col grid-rows-[minmax(0,1fr)] divide-x divide-border sm:auto-cols-[minmax(280px,1fr)]">
        {columns.data.map((column) => (
          <div
            key={column.id}
            id={`board-column-${column.id}`}
            className="min-w-0"
          >
            <ColumnItem column={column} />
          </div>
        ))}
      </div>
    </div>
  );
}
