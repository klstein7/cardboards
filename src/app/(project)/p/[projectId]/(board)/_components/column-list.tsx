"use client";

import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { useEffect, useRef } from "react";

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

    const element = ref.current;

    return autoScrollForElements({
      element,
    });
  }, []);

  if (columns.isError) throw columns.error;
  if (columns.isPending) return <div>Loading...</div>;

  return (
    <div
      ref={ref}
      className="scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-secondary/50 scrollbar-track-transparent overflow-y-auto border-t"
    >
      <div className="flex w-full max-w-7xl flex-col items-start gap-3 overflow-x-auto p-6 sm:flex-row sm:gap-6">
        {columns.data.map((column) => (
          <ColumnItem key={column.id} column={column} />
        ))}
      </div>
    </div>
  );
}
