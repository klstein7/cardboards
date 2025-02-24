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
    return autoScrollForElements({ element: ref.current });
  }, []);

  if (columns.isError) throw columns.error;
  if (columns.isPending) return <div>Loading...</div>;

  return (
    <div
      ref={ref}
      className="scrollbar-thumb-rounded-full h-full overflow-x-auto border-t scrollbar-thin scrollbar-track-transparent scrollbar-thumb-secondary/50"
    >
      <div className="flex max-w-7xl items-start gap-6 p-6">
        {columns.data.map((column) => (
          <ColumnItem key={column.id} column={column} />
        ))}
      </div>
    </div>
  );
}
