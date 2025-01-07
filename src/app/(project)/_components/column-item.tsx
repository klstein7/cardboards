import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { type api } from "~/server/api";
import { CreateCardDialog } from "./create-card-dialog";
import { CardList } from "./card-list";
import { CardRegistryProvider } from "../_store/card-registry";

interface ColumnItemProps {
  column: Awaited<ReturnType<typeof api.column.list>>[number];
}

export function ColumnItem({ column }: ColumnItemProps) {
  return (
    <CardRegistryProvider>
      <div className="flex flex-1 flex-col gap-3 rounded-md border bg-secondary/20 p-4">
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
    </CardRegistryProvider>
  );
}
