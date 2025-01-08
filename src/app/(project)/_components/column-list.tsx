"use client";

import { useColumns } from "~/lib/hooks";

import { CardRegistryProvider } from "../_store/card-registry";
import { ColumnItem } from "./column-item";

interface ColumnListProps {
  boardId: string;
}

export function ColumnList({ boardId }: ColumnListProps) {
  const columns = useColumns(boardId);

  if (columns.isError) throw columns.error;

  if (columns.isPending) return <div>Loading...</div>;

  return (
    <CardRegistryProvider>
      <div className="flex items-start gap-6">
        {columns.data.map((column) => (
          <ColumnItem key={column.id} column={column} />
        ))}
      </div>
    </CardRegistryProvider>
  );
}
