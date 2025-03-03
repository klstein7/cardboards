"use client";

import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { useEffect, useRef } from "react";

import { useColumns, useCurrentBoard } from "~/lib/hooks";
import { cn } from "~/lib/utils";

import { ColumnItem } from "./column-item";

interface ColumnListProps {
  boardId: string;
}

export function ColumnList({ boardId }: ColumnListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const columns = useColumns(boardId);
  const board = useCurrentBoard();

  useEffect(() => {
    if (!ref.current) return;
    return autoScrollForElements({ element: ref.current });
  }, []);

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
        "scrollbar-thumb-rounded-full h-full w-full overflow-y-auto scrollbar-thin scrollbar-track-transparent",
      )}
      style={
        {
          "--scrollbar-thumb": board.data
            ? `${board.data.color}`
            : "var(--secondary)",
        } as React.CSSProperties
      }
    >
      <div className="flex w-fit items-start gap-5 p-5">
        {columns.data.map((column) => (
          <div key={column.id} className="h-full w-[300px] flex-shrink-0">
            <ColumnItem column={column} />
          </div>
        ))}
      </div>
    </div>
  );
}
