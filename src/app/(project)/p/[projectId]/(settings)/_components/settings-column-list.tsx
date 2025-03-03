"use client";

import autoAnimate from "@formkit/auto-animate";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Skeleton } from "~/components/ui/skeleton";
import { useColumns, useShiftColumn } from "~/lib/hooks";

import { CreateColumnDialog } from "../../(board)/_components/create-column-dialog";
import { SettingsColumnItem } from "./settings-column-item";

interface SettingsColumnListProps {
  boardId: string;
}

export function SettingsColumnList({ boardId }: SettingsColumnListProps) {
  const parent = useRef<HTMLDivElement>(null);
  const columns = useColumns(boardId);
  const columnCount = columns.data?.length ?? 0;
  const shiftColumnMutation = useShiftColumn();
  const [shiftingColumnId, setShiftingColumnId] = useState<string | null>(null);

  const handleShiftColumn = (columnId: string, direction: "up" | "down") => {
    setShiftingColumnId(columnId);
    shiftColumnMutation.mutate(
      {
        columnId,
        data: { direction },
      },
      {
        onSuccess: () => {
          // Small delay to ensure UI updates after data is refreshed
          setTimeout(() => setShiftingColumnId(null), 300);
        },
        onError: () => {
          setShiftingColumnId(null);
        },
      },
    );
  };

  useEffect(() => {
    if (parent.current) {
      autoAnimate(parent.current);
    }
  }, [parent]);

  // Reset shifting state if mutation is not pending
  useEffect(() => {
    if (!shiftColumnMutation.isPending && shiftingColumnId) {
      setShiftingColumnId(null);
    }
  }, [shiftColumnMutation.isPending, shiftingColumnId]);

  if (columns.isPending) {
    return (
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          <span>Loading columns...</span>
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (columns.isError) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-destructive">
        Error loading columns. Please try again.
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {columnCount} {columnCount === 1 ? "column" : "columns"}
        </div>

        <CreateColumnDialog boardId={boardId} />
      </div>

      {columns.data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed px-4 py-6 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            No columns added to this board yet
          </p>
          <CreateColumnDialog boardId={boardId} />
        </div>
      ) : (
        <div className="flex flex-col gap-2" ref={parent}>
          {columns.data?.map((column, index) => (
            <SettingsColumnItem
              key={column.id}
              column={column}
              isFirst={index === 0}
              isLast={index === columns.data.length - 1}
              isDisabled={shiftColumnMutation.isPending}
              isShifting={shiftingColumnId === column.id}
              onShift={handleShiftColumn}
            />
          ))}
        </div>
      )}
    </div>
  );
}
