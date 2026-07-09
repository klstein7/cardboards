import { describe, expect, it } from "vitest";

import { type Card } from "~/app/(project)/_types";

import {
  applyOptimisticCardMove,
  getCardTargetMoveIndex,
  getColumnTargetMoveIndex,
  isCardMoveNoop,
} from "../card-move";

function card(id: number, order: number, columnId: string) {
  return {
    id,
    order,
    columnId,
    title: `Card ${id}`,
  } as Card;
}

describe("card move calculations", () => {
  it("uses final-index semantics when moving forward in a lane", () => {
    expect(
      getCardTargetMoveIndex({
        sourceIndex: 0,
        targetIndex: 2,
        sourceColumnId: "todo",
        destinationColumnId: "todo",
        destinationCardCount: 3,
        closestEdge: "top",
      }),
    ).toBe(1);

    expect(
      getCardTargetMoveIndex({
        sourceIndex: 0,
        targetIndex: 2,
        sourceColumnId: "todo",
        destinationColumnId: "todo",
        destinationCardCount: 3,
        closestEdge: "bottom",
      }),
    ).toBe(2);
  });

  it("uses final-index semantics when moving backward in a lane", () => {
    expect(
      getCardTargetMoveIndex({
        sourceIndex: 2,
        targetIndex: 0,
        sourceColumnId: "todo",
        destinationColumnId: "todo",
        destinationCardCount: 3,
        closestEdge: "bottom",
      }),
    ).toBe(1);
  });

  it("clamps cross-lane card targets and appends lane-background drops", () => {
    expect(
      getCardTargetMoveIndex({
        sourceIndex: 0,
        targetIndex: 1,
        sourceColumnId: "todo",
        destinationColumnId: "doing",
        destinationCardCount: 2,
        closestEdge: "bottom",
      }),
    ).toBe(2);

    expect(
      getColumnTargetMoveIndex({
        sourceColumnId: "todo",
        destinationColumnId: "todo",
        destinationCardCount: 3,
      }),
    ).toBe(2);
    expect(
      getColumnTargetMoveIndex({
        sourceColumnId: "todo",
        destinationColumnId: "doing",
        destinationCardCount: 3,
      }),
    ).toBe(3);
  });

  it("detects no-op drops", () => {
    expect(
      isCardMoveNoop({
        sourceIndex: 1,
        newOrder: 1,
        sourceColumnId: "todo",
        destinationColumnId: "todo",
      }),
    ).toBe(true);
    expect(
      isCardMoveNoop({
        sourceIndex: 1,
        newOrder: 1,
        sourceColumnId: "todo",
        destinationColumnId: "doing",
      }),
    ).toBe(false);
  });
});

describe("optimistic card moves", () => {
  it("reorders and reindexes a lane without mutating the source array", () => {
    const source = [card(1, 0, "todo"), card(2, 1, "todo"), card(3, 2, "todo")];
    const result = applyOptimisticCardMove({
      cardId: 1,
      sourceColumnId: "todo",
      destinationColumnId: "todo",
      newOrder: 2,
      sourceCards: source,
      destinationCards: source,
    });

    expect(result?.sourceCards.map(({ id, order }) => [id, order])).toEqual([
      [2, 0],
      [3, 1],
      [1, 2],
    ]);
    expect(source.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it("moves across lanes, clamps insertion, and reindexes both caches", () => {
    const result = applyOptimisticCardMove({
      cardId: 2,
      sourceColumnId: "todo",
      destinationColumnId: "doing",
      newOrder: 99,
      sourceCards: [card(1, 0, "todo"), card(2, 1, "todo")],
      destinationCards: [card(3, 0, "doing")],
    });

    expect(result?.sourceCards.map(({ id, order }) => [id, order])).toEqual([
      [1, 0],
    ]);
    expect(
      result?.destinationCards?.map(({ id, order, columnId }) => [
        id,
        order,
        columnId,
      ]),
    ).toEqual([
      [3, 0, "doing"],
      [2, 1, "doing"],
    ]);
  });

  it("returns null when the source card is not cached", () => {
    expect(
      applyOptimisticCardMove({
        cardId: 4,
        sourceColumnId: "todo",
        destinationColumnId: "doing",
        newOrder: 0,
        sourceCards: [card(1, 0, "todo")],
        destinationCards: [],
      }),
    ).toBeNull();
  });
});
