import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "~/components/ui/button";
import { useMoveCard } from "~/lib/hooks";
import { retryFlash } from "~/lib/utils";
import { type api } from "~/server/api";

import { useCardRegistry } from "../_store/card-registry";
import { type DropData } from "../_types";
import { CardList } from "./card-list";
import { CreateCardDialog } from "./create-card-dialog";

interface ColumnItemProps {
  column: Awaited<ReturnType<typeof api.column.list>>[number];
}

export function ColumnItem({ column }: ColumnItemProps) {
  const queryClient = useQueryClient();

  const columnElementRef = useRef<HTMLDivElement>(null);
  const [isDropping, setIsDropping] = useState(false);

  const moveCardMutation = useMoveCard();

  const { get } = useCardRegistry();

  useEffect(() => {
    if (!columnElementRef.current) {
      return;
    }

    const element = columnElementRef.current;

    return dropTargetForElements({
      element,
      getData: ({ input }) =>
        attachClosestEdge(
          {
            type: "column",
            payload: column,
          } satisfies DropData,
          {
            element,
            input,
            allowedEdges: ["top", "bottom"],
          },
        ),
      onDragEnter: () => {
        setIsDropping(true);
      },
      onDragLeave: () => {
        setIsDropping(false);
      },
      onDrop: ({ source, location }) => {
        setIsDropping(false);

        const isColumnDroppable =
          location.current.dropTargets.length === 1 &&
          location.current.dropTargets.some(
            (target) => (target.data as unknown as DropData).type === "column",
          );

        if (!isColumnDroppable) return;

        const target = location.current.dropTargets[0];

        if (!target) return;

        const sourceData = source.data as unknown as DropData;

        if (sourceData.type !== "card") return;

        const targetData = target.data as unknown as DropData;

        const closestEdge = extractClosestEdge(
          targetData as unknown as Record<string, unknown>,
        );

        const cards = queryClient.getQueryData<
          Awaited<ReturnType<typeof api.card.list>>
        >(["cards", column.id]);

        if (!cards) return;

        moveCardMutation.mutate({
          cardId: sourceData.payload.id,
          destinationColumnId: targetData.payload.id,
          sourceColumnId: sourceData.payload.columnId,
          newOrder: closestEdge === "top" ? 0 : cards.length,
        });

        retryFlash(sourceData.payload.id, {
          getElement: (cardId) => get(cardId),
          isCrossColumnMove:
            sourceData.payload.columnId !== targetData.payload.id,
        });
      },
    });
  }, []);

  return (
    <div
      ref={columnElementRef}
      className="flex flex-1 flex-col gap-3 rounded-md border bg-secondary/20 p-4"
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
