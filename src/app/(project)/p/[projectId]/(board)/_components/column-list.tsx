"use client";

import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { Plus } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "~/components/ui/button";
import { useColumns } from "~/lib/hooks";

import { ColumnItem } from "./column-item";

interface ColumnListProps {
  boardId: string;
}

export function ColumnList({ boardId }: ColumnListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const columns = useColumns(boardId);

  useEffect(() => {
    if (!ref.current) return;
    return autoScrollForElements({ element: ref.current });
  }, []);

  if (columns.isError) throw columns.error;
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
      className="scrollbar-thumb-rounded-full h-full w-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-secondary/50"
    >
      <div className="flex h-full w-fit gap-5 p-5">
        {columns.data.map((column) => (
          <div key={column.id} className="h-full w-[300px] flex-shrink-0">
            <ColumnItem column={column} />
          </div>
        ))}

        <div className="h-full w-[300px] flex-shrink-0">
          <div className="flex h-full flex-col rounded-lg border border-dashed border-muted-foreground/25 bg-card/30 transition-colors hover:border-muted-foreground/50 hover:bg-card/50">
            <Button
              variant="ghost"
              className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/40">
                <Plus className="h-6 w-6" />
              </div>
              <span className="font-medium">Add Column</span>
            </Button>
          </div>
        </div>

        <div className="h-1 w-6 flex-shrink-0" aria-hidden="true" />
      </div>
    </div>
  );
}
