"use client";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
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
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  useCards,
  useColumns,
  useCurrentBoard,
  useMoveCard,
  useShiftColumn,
} from "~/lib/hooks";
import { useIsAdmin } from "~/lib/hooks/project-user/use-is-admin";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [justMoved, setJustMoved] = useState(false);
  const isAdmin = useIsAdmin();

  const cards = useCards(column.id);
  const moveCardMutation = useMoveCard();
  const shiftColumnMutation = useShiftColumn();
  const columns = useColumns(column.boardId);

  const isMovingColumn = shiftColumnMutation.isPending;

  const board = useCurrentBoard();

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
  }, [column, moveCardMutation]);

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

  if (cards.isError) {
    return <div>Error: {cards.error.message}</div>;
  }

  return (
    <div
      ref={columnRef}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-lg border bg-card/30 shadow-sm transition-all duration-200",
        isDropping && "ring-2 ring-offset-2 ring-offset-background",
        column.isCompleted &&
          "border-green-300 bg-green-50/40 dark:border-green-700/50 dark:bg-green-950/10",
        justMoved && "animate-column-moved",
      )}
      style={{
        ...(isDropping
          ? {
              boxShadow: `0 0 0 2px ${board.data?.color ?? "#000000"}, 0 0 0 4px var(--background)`,
              borderColor: board.data?.color ?? "#000000",
              backgroundColor: `${board.data?.color}10`,
            }
          : {}),
        ...(justMoved
          ? ({
              "--column-color-rgb": board.data?.color
                ? `${parseInt(board.data.color.slice(1, 3), 16)}, ${parseInt(board.data.color.slice(3, 5), 16)}, ${parseInt(board.data.color.slice(5, 7), 16)}`
                : "0, 0, 0",
            } as React.CSSProperties)
          : {}),
        ...(column.isCompleted && !isDropping && !justMoved
          ? {
              borderColor: "rgba(34, 197, 94, 0.4)",
              boxShadow: "0 1px 3px rgba(34, 197, 94, 0.1)",
            }
          : {}),
      }}
      aria-describedby={`${column.name}-column`}
    >
      <div
        className={cn(
          "flex items-center justify-between border-b p-3",
          column.isCompleted
            ? "border-b-green-300 bg-green-50/50 dark:border-b-green-700/40 dark:bg-green-900/15"
            : "bg-card/50",
        )}
      >
        <div className="flex items-center gap-2">
          {column.isCompleted && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            </div>
          )}
          <span
            className={cn(
              "font-medium text-foreground",
              column.isCompleted && "text-green-800 dark:text-green-300",
            )}
          >
            {column.name}
          </span>
          <Badge
            variant="secondary"
            className={cn(
              "ml-1 text-xs",
              column.isCompleted &&
                "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
            )}
          >
            {cardCount}
          </Badge>
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
              <Button variant="ghost" size="icon" className="h-8 w-8">
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
      </div>

      <div
        className={cn(
          "flex-1 overflow-y-auto p-2",
          column.isCompleted && "bg-green-50/20 dark:bg-green-950/10",
        )}
      >
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
      {column.isCompleted && (
        <div className="border-t border-green-200 p-2 dark:border-green-800/30">
          <div className="flex items-center justify-center py-1 text-xs font-medium text-green-700 dark:text-green-400">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            <span>Completed</span>
          </div>
        </div>
      )}
    </div>
  );
}
