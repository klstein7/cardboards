"use client";

import { ChevronDown, ChevronUp, Pencil, Trash } from "lucide-react";
import { useState } from "react";

import { type Column } from "~/app/(project)/_types";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useShiftColumn } from "~/lib/hooks";

import { EditColumnDialog } from "../../(board)/_components/edit-column-dialog";

interface SettingsColumnItemProps {
  column: Column;
}

export function SettingsColumnItem({ column }: SettingsColumnItemProps) {
  const [open, setOpen] = useState(false);

  const shiftColumnMutation = useShiftColumn();

  return (
    <div className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50">
      <div className="flex items-center gap-4">
        <div className="font-medium">{column.name}</div>
        {column.isCompleted && (
          <Badge variant="secondary">Completion column</Badge>
        )}
      </div>
      <div className="flex items-center gap-1">
        <div className="flex items-center border-r pr-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted"
            onClick={() =>
              shiftColumnMutation.mutate({
                columnId: column.id,
                data: { direction: "up" },
              })
            }
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted"
            onClick={() =>
              shiftColumnMutation.mutate({
                columnId: column.id,
                data: { direction: "down" },
              })
            }
          >
            <ChevronDown className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1 pl-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted"
            onClick={() => setOpen(true)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash className="size-4" />
          </Button>
        </div>
      </div>
      <EditColumnDialog column={column} open={open} onOpenChange={setOpen} />
    </div>
  );
}
