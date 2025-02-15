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
import { Trash, User, UserCircle } from "lucide-react";
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
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { DropIndicator } from "~/components/ui/drop-indicator";
import {
  useAssignToCurrentUser,
  useCurrentBoard,
  useDeleteCard,
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

  const [, setSelectedCardId] = useQueryState("cardId");

  const deleteCardMutation = useDeleteCard();
  const assignToCurrentUserMutation = useAssignToCurrentUser();

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
    <AlertDialog>
      <ContextMenu modal={false}>
        <ContextMenuTrigger asChild>
          <div
            ref={cardElementRef}
            className={cn(
              "relative flex cursor-pointer select-none flex-col gap-2 p-1 sm:gap-3 sm:p-0",
              activeCard?.id === card.id && "opacity-50",
            )}
            onClick={() => setSelectedCardId(card.id.toString())}
          >
            <CardBase
              card={card}
              isDragging={activeCard?.id === card.id}
              isCompleted={isCompleted}
            />
            {closestEdge && (
              <DropIndicator
                edge={closestEdge}
                gap={1}
                color={board.data?.color}
              />
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="min-w-[200px]">
          <ContextMenuItem asChild>
            <div
              role="button"
              className="flex items-center gap-2"
              onClick={() => {
                assignToCurrentUserMutation.mutate(card.id);
              }}
            >
              <UserCircle className="size-4" />
              <span>Assign to me</span>
            </div>
          </ContextMenuItem>
          <AlertDialogTrigger asChild>
            <ContextMenuItem asChild>
              <div className="flex items-center gap-2">
                <Trash className="size-4" />
                <span>Delete</span>
              </div>
            </ContextMenuItem>
          </AlertDialogTrigger>
        </ContextMenuContent>
      </ContextMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete card</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this card?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteCardMutation.isPending}
            className="bg-destructive text-destructive-foreground"
            onClick={async () => {
              await deleteCardMutation.mutateAsync(card.id);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
