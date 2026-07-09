import { type Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";

import { type Card } from "~/app/(project)/_types";

interface CardTargetMoveIndexOptions {
  sourceIndex: number;
  targetIndex: number;
  sourceColumnId: string;
  destinationColumnId: string;
  destinationCardCount: number;
  closestEdge: Edge | null;
}

interface ColumnTargetMoveIndexOptions {
  sourceColumnId: string;
  destinationColumnId: string;
  destinationCardCount: number;
}

interface CardMoveNoopOptions {
  sourceIndex: number;
  newOrder: number;
  sourceColumnId: string;
  destinationColumnId: string;
}

interface OptimisticCardMoveOptions {
  cardId: number;
  sourceColumnId: string;
  destinationColumnId: string;
  newOrder: number;
  sourceCards: Card[];
  destinationCards: Card[];
}

export interface OptimisticCardMoveResult {
  sourceCards: Card[];
  destinationCards?: Card[];
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function sortByOrder(cards: Card[]) {
  return [...cards].sort((first, second) => first.order - second.order);
}

function reindex(cards: Card[]) {
  return cards.map((card, order) => ({ ...card, order }));
}

/** Resolve the final server index when a card is dropped against another card. */
export function getCardTargetMoveIndex({
  sourceIndex,
  targetIndex,
  sourceColumnId,
  destinationColumnId,
  destinationCardCount,
  closestEdge,
}: CardTargetMoveIndexOptions) {
  if (sourceColumnId === destinationColumnId) {
    return getReorderDestinationIndex({
      startIndex: sourceIndex,
      indexOfTarget: targetIndex,
      closestEdgeOfTarget: closestEdge,
      axis: "vertical",
    });
  }

  const proposedIndex = targetIndex + (closestEdge === "bottom" ? 1 : 0);
  return clamp(proposedIndex, 0, destinationCardCount);
}

/** Resolve an append drop against a lane background or empty state. */
export function getColumnTargetMoveIndex({
  sourceColumnId,
  destinationColumnId,
  destinationCardCount,
}: ColumnTargetMoveIndexOptions) {
  if (sourceColumnId === destinationColumnId) {
    return Math.max(0, destinationCardCount - 1);
  }

  return destinationCardCount;
}

export function isCardMoveNoop({
  sourceIndex,
  newOrder,
  sourceColumnId,
  destinationColumnId,
}: CardMoveNoopOptions) {
  return sourceColumnId === destinationColumnId && sourceIndex === newOrder;
}

/** Apply the same final-index semantics as the server without mutating cache data. */
export function applyOptimisticCardMove({
  cardId,
  sourceColumnId,
  destinationColumnId,
  newOrder,
  sourceCards,
  destinationCards,
}: OptimisticCardMoveOptions): OptimisticCardMoveResult | null {
  const orderedSourceCards = sortByOrder(sourceCards);
  const sourceCard = orderedSourceCards.find((card) => card.id === cardId);

  if (!sourceCard) return null;

  if (sourceColumnId === destinationColumnId) {
    const remainingCards = orderedSourceCards.filter(
      (card) => card.id !== cardId,
    );
    const destinationIndex = clamp(newOrder, 0, remainingCards.length);
    const reorderedCards = [
      ...remainingCards.slice(0, destinationIndex),
      sourceCard,
      ...remainingCards.slice(destinationIndex),
    ];

    return { sourceCards: reindex(reorderedCards) };
  }

  const orderedDestinationCards = sortByOrder(destinationCards).filter(
    (card) => card.id !== cardId,
  );
  const destinationIndex = clamp(
    newOrder,
    0,
    orderedDestinationCards.length,
  );
  const movedCard = {
    ...sourceCard,
    columnId: destinationColumnId,
    order: destinationIndex,
  };

  return {
    sourceCards: reindex(
      orderedSourceCards.filter((card) => card.id !== cardId),
    ),
    destinationCards: reindex([
      ...orderedDestinationCards.slice(0, destinationIndex),
      movedCard,
      ...orderedDestinationCards.slice(destinationIndex),
    ]),
  };
}
