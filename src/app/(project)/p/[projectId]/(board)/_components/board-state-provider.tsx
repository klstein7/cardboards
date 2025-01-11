"use client";

import { createContext, useContext, useRef, useState } from "react";
import invariant from "tiny-invariant";

import { type Card } from "~/app/(project)/_types";

export type BoardState = {
  activeCard: Card | null;
  setActiveCard: (card: Card | null) => void;
  getCard: (cardId: number) => HTMLDivElement | null;
  registerCard: (cardId: number, card: HTMLDivElement) => void;
  unregisterCard: (cardId: number) => void;
};

export const BoardStateContext = createContext<BoardState | null>(null);

export function BoardStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const cardRegistry = useRef<Map<number, HTMLDivElement>>(new Map());

  function getCard(cardId: number) {
    return cardRegistry.current.get(cardId) ?? null;
  }

  function registerCard(cardId: number, card: HTMLDivElement) {
    cardRegistry.current.set(cardId, card);
  }

  function unregisterCard(cardId: number) {
    cardRegistry.current.delete(cardId);
  }

  return (
    <BoardStateContext.Provider
      value={{
        activeCard,
        setActiveCard,
        getCard,
        registerCard,
        unregisterCard,
      }}
    >
      {children}
    </BoardStateContext.Provider>
  );
}

export function useBoardState() {
  const context = useContext(BoardStateContext);
  invariant(context, "BoardStateContext not found");
  return context;
}
