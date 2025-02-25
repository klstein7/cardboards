"use client";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { attachClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Ellipsis, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { type Column } from "~/app/(project)/_types";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useCards, useCurrentBoard, useMoveCard } from "~/lib/hooks";
import { cn } from "~/lib/utils";

import { CardList } from "./card-list";
import { CreateCardDialog } from "./create-card-dialog";
import { EditColumnDialog } from "./edit-column-dialog";

interface ColumnItemProps {
  column: Column;
}

export function ColumnItem({ column }: ColumnItemProps) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [isDropping, setIsDropping] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const cards = useCards(column.id);
  const moveCardMutation = useMoveCard();

  const board = useCurrentBoard();

  useEffect(() => {
    const columnElement = columnRef.current;
    if (!columnElement) return;

    return combine(
      dropTargetForElements({
        element: columnElement,
        canDrop({ source }) {
          return source.data.type === "card";
        },
        getData({ input }) {
          return attachClosestEdge(
            {
              type: "column",
              payload: column,
              columnId: column.id,
            },
            {
              element: columnElement,
              input,
              allowedEdges: ["top", "bottom"],
            },
          );
        },
        onDragEnter() {
          setIsDropping(true);
        },
        onDragLeave() {
          setIsDropping(false);
        },
        onDrop() {
          setIsDropping(false);
        },
      }),
    );
  }, [cards.data?.length, column, moveCardMutation]);

  if (cards.isError) throw cards.error;

  const cardCount = cards.data?.length ?? 0;

  return (
    <div
      ref={columnRef}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-lg border bg-card/30 shadow-sm transition-all duration-200",
        isDropping && "ring-2 ring-offset-2 ring-offset-background",
      )}
      style={
        isDropping
          ? ({
              boxShadow: `0 0 0 2px ${board.data?.color ?? "#000000"}, 0 0 0 4px var(--background)`,
              borderColor: board.data?.color ?? "#000000",
              backgroundColor: `${board.data?.color}10`,
            } as React.CSSProperties)
          : undefined
      }
      aria-describedby={`${column.name}-column`}
    >
      <div className="flex items-center justify-between border-b bg-card/50 p-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{column.name}</span>
          <Badge variant="secondary" className="ml-1 text-xs">
            {cardCount}
          </Badge>
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Ellipsis className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="w-48">
            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit column</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete column</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <EditColumnDialog
          column={column}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <CardList columnId={column.id} isCompleted={column.isCompleted} />
      </div>

      {!column.isCompleted && (
        <div className="border-t p-2">
          <CreateCardDialog
            trigger={
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Add card</span>
              </Button>
            }
            columnId={column.id}
          />
        </div>
      )}
    </div>
  );
}
