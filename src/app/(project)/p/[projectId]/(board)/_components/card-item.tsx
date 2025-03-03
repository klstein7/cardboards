// src/app/(project)/p/[projectId]/(board)/_components/card-item.tsx
"use client";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Copy, Edit, Trash, UserCircle } from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";

import { type Card } from "~/app/(project)/_types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { DropIndicator } from "~/components/ui/drop-indicator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  useAssignToCurrentUser,
  useCurrentBoard,
  useDeleteCard,
  useDuplicateCard,
} from "~/lib/hooks";
import { cn } from "~/lib/utils";

import { useBoardState } from "./board-state-provider";
import { CardBase } from "./card-base";

interface CardItemProps {
  card: Card;
  index: number;
  isCompleted: boolean;
  columnId: string;
}

export function CardItem({
  card,
  index,
  isCompleted,
  columnId,
}: CardItemProps) {
  const board = useCurrentBoard();
  const { activeCard, setActiveCard, registerCard, unregisterCard } =
    useBoardState();
  const cardElementRef = useRef<HTMLDivElement>(null);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const [, setSelectedCardId] = useQueryState("cardId");

  const deleteCardMutation = useDeleteCard();
  const assignToCurrentUserMutation = useAssignToCurrentUser();
  const duplicateCardMutation = useDuplicateCard();

  useEffect(() => {
    const cardElement = cardElementRef.current;
    if (!cardElement) return;

    registerCard(card.id, cardElement);

    return combine(
      draggable({
        element: cardElement,
        getInitialData: () => ({
          type: "card",
          payload: card,
          index,
          columnId,
        }),
        onDragStart: () => {
          setActiveCard(card);
        },
        onDrop: () => {
          setActiveCard(null);
        },
      }),
      dropTargetForElements({
        element: cardElement,
        canDrop({ source }) {
          return source.data.type === "card";
        },
        getData: ({ input }) =>
          attachClosestEdge(
            {
              type: "card",
              payload: card,
              columnId,
            },
            {
              element: cardElement,
              input,
              allowedEdges: ["top", "bottom"],
            },
          ),
        onDrag: ({ source, self }) => {
          const sourceData = source.data as { payload: Card };
          if (sourceData.payload.id !== card.id) {
            const edge = extractClosestEdge(self.data);
            setClosestEdge(edge);
          }
        },
        onDragEnter: ({ source, self }) => {
          const sourceData = source.data as { payload: Card };
          if (sourceData.payload.id !== card.id) {
            const edge = extractClosestEdge(self.data);
            setClosestEdge(edge);
          }
        },
        onDragLeave: () => {
          setClosestEdge(null);
        },
        onDrop: () => {
          setClosestEdge(null);
        },
      }),
      () => {
        unregisterCard(card.id);
      },
    );
  }, [card, index, columnId, setActiveCard, registerCard, unregisterCard]);

  return (
    <TooltipProvider>
      <AlertDialog>
        <ContextMenu modal={false}>
          <ContextMenuTrigger asChild>
            <div
              ref={cardElementRef}
              className={cn(
                "relative flex cursor-grab select-none flex-col gap-3 p-0.5 transition-all duration-300",
                activeCard?.id === card.id && "cursor-grabbing opacity-50",
              )}
              onClick={() => setSelectedCardId(card.id.toString())}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              data-card-id={card.id}
              aria-label={`Card: ${card.title}`}
            >
              {isHovered && !activeCard && (
                <div
                  className="absolute -right-1 -top-1 z-10 flex gap-1.5 opacity-0 transition-all duration-200 group-hover:opacity-100"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? "translateY(0)" : "translateY(-5px)",
                  }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-card/95 text-muted-foreground shadow-md transition-all duration-200 hover:bg-card hover:text-foreground hover:shadow-lg"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await setSelectedCardId(card.id.toString());
                        }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="font-medium">
                      Edit Card
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              <CardBase
                card={card}
                isDragging={activeCard?.id === card.id}
                isCompleted={isCompleted}
              />

              {closestEdge && (
                <DropIndicator
                  edge={closestEdge}
                  gap={4}
                  color={board.data?.color}
                />
              )}
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent className="min-w-[220px] rounded-lg border-border/80 p-2 shadow-lg backdrop-blur-sm">
            <ContextMenuItem
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus:bg-muted"
              onClick={() => setSelectedCardId(card.id.toString())}
            >
              <Edit className="size-4 text-muted-foreground" />
              <span>Edit card</span>
            </ContextMenuItem>

            <ContextMenuItem
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus:bg-muted"
              onClick={() => assignToCurrentUserMutation.mutate(card.id)}
            >
              <UserCircle className="size-4 text-muted-foreground" />
              <span>Assign to me</span>
            </ContextMenuItem>

            <ContextMenuSeparator className="my-1.5 h-px bg-border/60" />

            <ContextMenuItem
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus:bg-muted"
              onClick={() => duplicateCardMutation.mutate({ cardId: card.id })}
            >
              <Copy className="size-4 text-muted-foreground" />
              <span>Duplicate</span>
            </ContextMenuItem>

            <ContextMenuSeparator className="my-1.5 h-px bg-border/60" />

            <AlertDialogTrigger asChild>
              <ContextMenuItem className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus:bg-destructive/10">
                <Trash className="size-4" />
                <span>Delete</span>
              </ContextMenuItem>
            </AlertDialogTrigger>
          </ContextMenuContent>
        </ContextMenu>

        <AlertDialogContent className="max-w-md rounded-lg shadow-lg backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this card? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteCardMutation.isPending}
              className="bg-destructive font-medium text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                await deleteCardMutation.mutateAsync({ cardId: card.id });
              }}
            >
              {deleteCardMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
