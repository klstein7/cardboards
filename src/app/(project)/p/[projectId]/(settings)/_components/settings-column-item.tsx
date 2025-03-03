"use client";

import { ChevronDown, ChevronUp, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { type Column } from "~/app/(project)/_types";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useShiftColumn } from "~/lib/hooks";
import { cn } from "~/lib/utils";

import { EditColumnDialog } from "../../(board)/_components/edit-column-dialog";

interface SettingsColumnItemProps {
  column: Column;
  isFirst?: boolean;
  isLast?: boolean;
  isDisabled?: boolean;
  isShifting?: boolean;
  onShift?: (columnId: string, direction: "up" | "down") => void;
}

export function SettingsColumnItem({
  column,
  isFirst = false,
  isLast = false,
  isDisabled = false,
  isShifting = false,
  onShift,
}: SettingsColumnItemProps) {
  const [open, setOpen] = useState(false);
  const shiftColumnMutation = useShiftColumn();

  const handleShiftColumn = (direction: "up" | "down") => {
    if (onShift) {
      onShift(column.id, direction);
    } else {
      shiftColumnMutation.mutate(
        {
          columnId: column.id,
          data: { direction },
        },
        {
          onSuccess: () => {
            toast.success(`Column moved ${direction}`);
          },
          onError: () => {
            toast.error(`Failed to move column ${direction}`);
          },
        },
      );
    }
  };

  const isPending = isDisabled || shiftColumnMutation.isPending || isShifting;

  return (
    <div
      className={cn(
        "relative flex items-center justify-between rounded-md border p-3 transition-colors",
        isPending ? "bg-muted/50" : "hover:bg-muted/30",
      )}
    >
      {/* Column info */}
      <div className="flex items-center gap-3">
        {/* Column color indicator */}
        <div
          className="h-4 w-1 rounded-full"
          style={{
            backgroundColor: column.isCompleted ? "#10b981" : "#6366f1",
          }}
        />

        {/* Column name and badges */}
        <div className="flex flex-col gap-1">
          <div className="font-medium">{column.name}</div>
          {column.isCompleted && (
            <Badge
              variant="outline"
              className="bg-emerald-50 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
            >
              Completion column
            </Badge>
          )}
        </div>
      </div>

      {/* Column actions */}
      <div className="flex items-center gap-1">
        {/* Re-ordering buttons */}
        <div className="flex items-center border-r pr-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-muted"
                  disabled={isPending || isFirst}
                  onClick={() => handleShiftColumn("up")}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Move column up</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-muted"
                  disabled={isPending || isLast}
                  onClick={() => handleShiftColumn("down")}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Move column down</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Edit and delete buttons */}
        <div className="flex items-center gap-1 pl-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-muted"
                  onClick={() => setOpen(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Edit column</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() =>
                    toast.error(
                      "Delete column functionality not implemented yet",
                    )
                  }
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Delete column</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Edit column dialog */}
      <EditColumnDialog column={column} open={open} onOpenChange={setOpen} />
    </div>
  );
}
