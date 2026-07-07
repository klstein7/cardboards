"use client";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { attachClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { type Column } from "~/app/(project)/_types";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useCards, useColumns, useMoveCard, useShiftColumn } from "~/lib/hooks";
import { useIsAdmin } from "~/lib/hooks/project-user/use-is-admin";
import { cn } from "~/lib/utils";

import { CardList } from "./card-list";
import { CreateCardDialog } from "./create-card-dialog";
import { DeleteColumnDialog } from "./delete-column-dialog";
import { EditColumnDialog } from "./edit-column-dialog";

interface ColumnItemProps {
  column: Column;
}

// Stage-rail hues drawn from the app's existing priority palette, assigned by
// column position. Red is intentionally omitted (reserved for errors/overdue).
const RAIL_PALETTE = [
  "hsl(var(--primary))",
  "var(--priority-high-color)",
  "var(--priority-low-color)",
  "var(--priority-medium-color)",
];

export function ColumnItem({ column }: ColumnItemProps) {
  const columnRef = useRef<HTMLDivElement>(null);
  const cardListRef = useRef<HTMLDivElement>(null);
  const [isDropping, setIsDropping] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [justMoved, setJustMoved] = useState(false);
  const isAdmin = useIsAdmin();

  const cards = useCards(column.id);
  const moveCardMutation = useMoveCard();
  const shiftColumnMutation = useShiftColumn();
  const columns = useColumns(column.boardId);

  const isMovingColumn = shiftColumnMutation.isPending;

  const centerColumnInView = () => {
    setTimeout(() => {
      if (!columnRef.current) return;

      try {
        const columnElement = columnRef.current;
        const scrollContainer = columnElement.closest(".overflow-x-auto");

        if (!scrollContainer) return;

        const columnRect = columnElement.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();

        const buffer = containerRect.width * 0.2;
        const visibleLeftEdge = containerRect.left + buffer;
        const visibleRightEdge = containerRect.right - buffer;

        const needsScrolling =
          columnRect.left < visibleLeftEdge ||
          columnRect.right > visibleRightEdge;

        if (needsScrolling) {
          const columnCenter = columnElement.offsetLeft + columnRect.width / 2;
          const containerCenter = containerRect.width / 2;
          const newScrollLeft = columnCenter - containerCenter;

          scrollContainer.scrollTo({
            left: newScrollLeft,
            behavior: "smooth",
          });
        }
      } catch (error) {
        console.error("Error scrolling column into view:", error);
      }
    }, 250);
  };

  useEffect(() => {
    const columnElement = columnRef.current;
    if (!columnElement) return;

    const cleanup = combine(
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

    return cleanup;
  }, [column, moveCardMutation]);

  useEffect(() => {
    const cardListElement = cardListRef.current;
    if (!cardListElement) return;

    const cleanup = autoScrollForElements({
      element: cardListElement,
    });

    return cleanup;
  }, []);

  useEffect(() => {
    if (justMoved) {
      centerColumnInView();

      const timer = setTimeout(() => {
        setJustMoved(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [justMoved]);

  const handleShiftColumn = async (direction: "up" | "down") => {
    try {
      await shiftColumnMutation.mutateAsync({
        columnId: column.id,
        data: { direction },
      });
      toast.success(
        `Column "${column.name}" moved ${direction === "up" ? "left" : "right"} successfully`,
      );
      setJustMoved(true);
      setIsDropdownOpen(false);
    } catch (error) {
      toast.error("Failed to move column", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const isFirst = column.order === 0;
  const isLast = column.order === (columns.data ?? []).length - 1;

  const cardCount = cards.data?.length ?? 0;
  const railColor = RAIL_PALETTE[column.order % RAIL_PALETTE.length];

  if (cards.isError) {
    return <div>Error: {cards.error.message}</div>;
  }

  return (
    <div
      ref={columnRef}
      className={cn(
        "group/column flex h-full w-full flex-col overflow-hidden border-t-2 transition-all duration-200",
        isDropping && "bg-primary/[0.04]",
        justMoved && "animate-column-moved",
      )}
      style={{
        borderTopColor: railColor,
        ...(isDropping
          ? {
              boxShadow: `0 0 0 2px hsl(var(--primary)), 0 0 0 4px var(--background)`,
              borderColor: "hsl(var(--primary))",
              backgroundColor: "hsl(var(--primary) / 0.1)",
            }
          : {}),
        ...(justMoved
          ? ({
              "--column-color-rgb": "var(--primary)",
            } as React.CSSProperties)
          : {}),
      }}
      aria-describedby={`${column.name}-column`}
    >
      <div className="flex items-center justify-between px-6 pb-3 pt-5">
        <div className="flex items-center gap-2">
          {column.isCompleted && (
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
          )}
          <span
            className={cn(
              "text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
              column.isCompleted && "text-primary",
            )}
          >
            {column.name}
          </span>
          <span className="flex h-4 min-w-4 items-center justify-center bg-primary px-1 font-mono text-[9px] text-primary-foreground">
            {cardCount}
          </span>
        </div>

        {isAdmin && (
          <DropdownMenu
            modal={false}
            open={isDropdownOpen}
            onOpenChange={(open) => {
              if (!open && isMovingColumn) return;
              setIsDropdownOpen(open);
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover/column:opacity-100 data-[state=open]:opacity-100 max-sm:opacity-100"
                aria-label={`Column options for ${column.name}`}
              >
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => setIsEditOpen(true)}
                disabled={isMovingColumn}
              >
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit column</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async (e) => {
                  e.preventDefault();
                  if (!isFirst && !isMovingColumn) {
                    await handleShiftColumn("up");
                  }
                }}
                disabled={isFirst || isMovingColumn}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                <span>Move left</span>
                {isMovingColumn &&
                  shiftColumnMutation.variables?.data.direction === "up" && (
                    <Loader2 className="ml-2 h-3 w-3 animate-spin" />
                  )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async (e) => {
                  e.preventDefault();
                  if (!isLast && !isMovingColumn) {
                    await handleShiftColumn("down");
                  }
                }}
                disabled={isLast || isMovingColumn}
              >
                <ChevronRight className="mr-2 h-4 w-4" />
                <span>Move right</span>
                {isMovingColumn &&
                  shiftColumnMutation.variables?.data.direction === "down" && (
                    <Loader2 className="ml-2 h-3 w-3 animate-spin" />
                  )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={isMovingColumn}
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete column</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <EditColumnDialog
          column={column}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />

        <DeleteColumnDialog
          column={column}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        />
      </div>

      <div ref={cardListRef} className="flex-1 overflow-y-auto px-6">
        <CardList columnId={column.id} isCompleted={column.isCompleted} />
      </div>

      {!column.isCompleted && (
        <div className="px-6 pb-5 pt-3">
          <CreateCardDialog
            trigger={
              <Button
                variant="ghost"
                className="h-8 w-full justify-start gap-1.5 px-0 text-sm text-muted-foreground hover:bg-transparent hover:text-primary"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add card</span>
              </Button>
            }
            columnId={column.id}
          />
        </div>
      )}
      {column.isCompleted && (
        <div className="flex items-center gap-1.5 px-6 pb-5 pt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
          <CheckCircle2 className="h-3 w-3" />
          <span>Completed</span>
        </div>
      )}
    </div>
  );
}
