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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  useAssignToCurrentUser,
  useDeleteCard,
  useDuplicateCard,
} from "~/lib/hooks";
import { useIsMobile } from "~/lib/hooks/utils";
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
  const [isHovered, setIsHovered] = useState(false);
  const [dragState, setDragState] = useState<DragState>({ type: "idle" });
  const isMobile = useIsMobile();

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
        "relative flex cursor-grab select-none flex-col gap-3 p-0.5 transition-all duration-300",
        activeCard?.id === card.id && "cursor-grabbing opacity-50",
      )}
      onClick={() => setSelectedCardId(card.id.toString())}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-card-id={card.id}
      aria-label={`Card: ${card.title}`}
    >
      {isHovered && !activeCard && !isMobile && (
        <div
          className="absolute -right-2 -top-2 z-10 flex gap-1.5 opacity-0 transition-all duration-200 group-hover:opacity-100"
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
        <DropIndicator edge={closestEdge} gap={4} color="hsl(var(--primary))" />
      )}
    </div>
  );

  return (
    <TooltipProvider>
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
              onClick={() =>
                assignToCurrentUserMutation.mutate({ cardId: card.id })
              }
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
              <ContextMenuItem
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus:bg-destructive/10"
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

        <AlertDialogContent className="max-w-md rounded-lg shadow-lg backdrop-blur-sm">
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
    </TooltipProvider>
  );
}
