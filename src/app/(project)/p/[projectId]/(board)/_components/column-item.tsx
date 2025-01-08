import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import { type api } from "~/server/api";

import { CardList } from "./card-list";
import { CreateCardDialog } from "./create-card-dialog";

interface ColumnItemProps {
  column: Awaited<ReturnType<typeof api.column.list>>[number];
}

export function ColumnItem({ column }: ColumnItemProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      payload: column,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-1 flex-col gap-3 rounded-md border bg-secondary/20 p-4"
      aria-describedby={`${column.name}-column`}
    >
      <span className="text-sm font-medium uppercase text-muted-foreground">
        {column.name}
      </span>
      <CardList columnId={column.id} />
      <CreateCardDialog
        trigger={
          <Button variant="outline" className="bg-transparent">
            <Plus className="h-4 w-4" />
            <span>Card</span>
          </Button>
        }
        columnId={column.id}
      />
    </div>
  );
}
