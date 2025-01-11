"use client";

import { createContext, useContext, useRef, useState } from "react";
import invariant from "tiny-invariant";

import { type Card } from "~/app/(project)/_types";

export type BoardState = {
  activeCard: Card | null;
  setActiveCard: (card: Card | null) => void;
  getCard: (cardId: string) => HTMLDivElement | null;
  registerCard: (cardId: string, card: HTMLDivElement) => void;
  unregisterCard: (cardId: string) => void;
};

export const BoardStateContext = createContext<BoardState | null>(null);

export function BoardStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const cardRegistry = useRef<Map<string, HTMLDivElement>>(new Map());

  function getCard(cardId: string) {
    return cardRegistry.current.get(cardId) ?? null;
  }

  function registerCard(cardId: string, card: HTMLDivElement) {
    cardRegistry.current.set(cardId, card);
  }

  function unregisterCard(cardId: string) {
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
