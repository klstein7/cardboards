"use client";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Copy, Edit, Trash, UserCircle } from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  useAssignToCurrentUser,
  useDeleteCard,
  useDuplicateCard,
} from "~/lib/hooks";
import { cn } from "~/lib/utils";

import { useBoardState } from "./board-state-provider";
import { CardBase } from "./card-base";
import { CardDragPreview } from "./card-drag-preview";

interface CardItemProps {
  card: Card;
  index: number;
  isCompleted: boolean;
  columnId: string;
}

type DragState =
  | { type: "idle" }
  | { type: "preview"; container: HTMLElement }
  | { type: "dragging" };

export function CardItem({
  card,
  index,
  isCompleted,
  columnId,
}: CardItemProps) {
  const { activeCard, setActiveCard, registerCard, unregisterCard } =
    useBoardState();
  const cardElementRef = useRef<HTMLDivElement>(null);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const [dragState, setDragState] = useState<DragState>({ type: "idle" });

  const [, setSelectedCardId] = useQueryState("cardId");

  const deleteCardMutation = useDeleteCard();
  const assignToCurrentUserMutation = useAssignToCurrentUser();
  const duplicateCardMutation = useDuplicateCard();

  useEffect(() => {
    return () => {
      setActiveCard(null);
      setDragState({ type: "idle" });
    };
  }, [setActiveCard]);

  useEffect(() => {
    const cardElement = cardElementRef.current;
    if (!cardElement) return;

    cardElement.classList.add("card-draggable");

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
        onGenerateDragPreview({ nativeSetDragImage }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            render({ container }) {
              setDragState({ type: "preview", container });
              return () => setDragState({ type: "dragging" });
            },
          });
        },
        onDragStart: () => {
          document.body.classList.add("dragging-card");
          setActiveCard(card);
        },
        onDrop: () => {
          document.body.classList.remove("dragging-card");
          setActiveCard(null);
          setDragState({ type: "idle" });

          setTimeout(() => {
            if (cardElementRef.current) {
              cardElementRef.current.classList.remove("no-drag");
            }
          }, 10);
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

  const cardContent = (
    <div
      ref={cardElementRef}
      className={cn(
        "relative flex cursor-grab select-none flex-col transition-all duration-300",
        activeCard?.id === card.id && "cursor-grabbing opacity-50",
      )}
      onClick={() => setSelectedCardId(card.id.toString())}
      data-card-id={card.id}
      aria-label={`Card: ${card.title}`}
    >
      <CardBase
        card={card}
        isDragging={activeCard?.id === card.id}
        isCompleted={isCompleted}
      />

      {closestEdge && (
        <DropIndicator edge={closestEdge} gap={1} color="hsl(var(--primary))" />
      )}
    </div>
  );

  return (
    <AlertDialog>
      <ContextMenu modal={false}>
        <ContextMenuTrigger
          asChild
          disabled={
            dragState.type === "preview" || dragState.type === "dragging"
          }
        >
          {cardContent}
        </ContextMenuTrigger>

        <ContextMenuContent className="min-w-[220px] border-border p-2 backdrop-blur-sm">
          <ContextMenuItem
            className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground"
            onClick={() => setSelectedCardId(card.id.toString())}
          >
            <Edit className="size-4 text-muted-foreground" />
            <span>Edit card</span>
          </ContextMenuItem>

          <ContextMenuItem
            className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground"
            onClick={() =>
              assignToCurrentUserMutation.mutate({ cardId: card.id })
            }
          >
            <UserCircle className="size-4 text-muted-foreground" />
            <span>Assign to me</span>
          </ContextMenuItem>

          <ContextMenuSeparator className="my-1.5 h-px bg-border/60" />

          <ContextMenuItem
            className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground"
            onClick={() => duplicateCardMutation.mutate({ cardId: card.id })}
          >
            <Copy className="size-4 text-muted-foreground" />
            <span>Duplicate</span>
          </ContextMenuItem>

          <ContextMenuSeparator className="my-1.5 h-px bg-border/60" />

          <AlertDialogTrigger asChild>
            <ContextMenuItem
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash className="size-4" />
              <span>Delete</span>
            </ContextMenuItem>
          </AlertDialogTrigger>
        </ContextMenuContent>
      </ContextMenu>

      {/* Custom Drag Preview Portal */}
      {dragState.type === "preview" &&
        createPortal(
          <CardDragPreview card={card} isCompleted={isCompleted} />,
          dragState.container,
        )}

      <AlertDialogContent className="max-w-md backdrop-blur-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete card</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this card? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteCardMutation.mutate({ cardId: card.id })}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
