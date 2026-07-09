"use client";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
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
import { useCards, useColumns, useShiftColumn } from "~/lib/hooks";
import { useIsAdmin } from "~/lib/hooks/project-user/use-is-admin";
import { cn } from "~/lib/utils";

import { CardList } from "./card-list";
import { CreateCardDialog } from "./create-card-dialog";
import { DeleteColumnDialog } from "./delete-column-dialog";
import { EditColumnDialog } from "./edit-column-dialog";

interface ColumnItemProps {
  column: Column;
}

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
          const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;

          scrollContainer.scrollTo({
            left: newScrollLeft,
            behavior: reduceMotion ? "auto" : "smooth",
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
        getData: () => ({
          type: "column",
          payload: column,
          columnId: column.id,
        }),
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
  }, [column]);

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

  return (
    <div
      ref={columnRef}
      className={cn(
        "group/column flex h-full w-full flex-col overflow-hidden transition-all duration-200 motion-reduce:transition-none",
        isDropping && "bg-primary/[0.035] ring-1 ring-inset ring-primary/15",
        justMoved && "animate-column-moved motion-reduce:animate-none",
      )}
      style={
        justMoved
          ? ({
              "--column-color-rgb": "var(--primary)",
            } as React.CSSProperties)
          : undefined
      }
      role="region"
      aria-labelledby={`board-column-title-${column.id}`}
    >
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border px-3.5">
        <div className="flex min-w-0 items-center gap-2">
          {column.isCompleted && (
            <CheckCircle2 className="h-3 w-3 shrink-0 text-primary" />
          )}
          <h2
            id={`board-column-title-${column.id}`}
            className="truncate text-[11px] font-medium uppercase tracking-[0.13em] text-muted-foreground"
          >
            {column.name}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="flex h-4 min-w-4 items-center justify-center bg-primary px-1 font-mono text-[9px] text-primary-foreground">
            {String(cardCount).padStart(2, "0")}
          </span>
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
                  className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity group-hover/column:opacity-100 data-[state=open]:opacity-100 hover:text-foreground focus-visible:opacity-100 max-sm:opacity-100"
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
                    shiftColumnMutation.variables?.data.direction ===
                      "down" && (
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
        </div>

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

      <div ref={cardListRef} className="flex-1 overflow-y-auto">
        <CardList columnId={column.id} isCompleted={column.isCompleted} />
      </div>

      {!column.isCompleted && (
        <div className="shrink-0 border-t border-border">
          <CreateCardDialog
            trigger={
              <Button
                variant="ghost"
                className="h-8 w-full justify-start gap-1.5 px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:bg-transparent hover:text-primary"
              >
                <Plus className="h-3 w-3" />
                <span>Add card</span>
              </Button>
            }
            columnId={column.id}
          />
        </div>
      )}
      {column.isCompleted && (
        <div className="flex h-8 shrink-0 items-center gap-1.5 border-t border-border px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
          <CheckCircle2 className="h-3 w-3" />
          <span>Completed</span>
        </div>
      )}
    </div>
  );
}
