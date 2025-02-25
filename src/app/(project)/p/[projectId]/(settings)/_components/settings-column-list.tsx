"use client";

import autoAnimate from "@formkit/auto-animate";
import { useEffect, useRef } from "react";

import { Skeleton } from "~/components/ui/skeleton";
import { useColumns } from "~/lib/hooks";

import { CreateColumnDialog } from "../../(board)/_components/create-column-dialog";
import { SettingsColumnItem } from "./settings-column-item";

interface SettingsColumnListProps {
  boardId: string;
}

export function SettingsColumnList({ boardId }: SettingsColumnListProps) {
  const parent = useRef<HTMLDivElement>(null);

  const columns = useColumns(boardId);

  useEffect(() => {
    if (parent.current) {
      autoAnimate(parent.current);
    }
  }, [parent]);

  if (columns.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (columns.isError) {
    return <div>Error loading columns</div>;
  }

  return (
    <div className="flex flex-col gap-4" ref={parent}>
      {columns.data?.map((column) => (
        <SettingsColumnItem key={column.id} column={column} />
      ))}
      <CreateColumnDialog boardId={boardId} />
    </div>
  );
}
