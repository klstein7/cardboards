"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import invariant from "tiny-invariant";

import { type Card } from "~/app/(project)/_types";

export type BoardState = {
  activeCard: Card | null;
  setActiveCard: (card: Card | null) => void;
  settledCardId: number | null;
  settleCard: (cardId: number, announcement: string) => void;
};

export const BoardStateContext = createContext<BoardState | null>(null);

export function BoardStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [settledCardId, setSettledCardId] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const settleCard = useCallback((cardId: number, message: string) => {
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);

    setSettledCardId(cardId);
    setAnnouncement(message);
    settleTimerRef.current = setTimeout(() => {
      setSettledCardId(null);
      settleTimerRef.current = null;
    }, 420);
  }, []);

  useEffect(
    () => () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    },
    [],
  );

  const value = useMemo(
    () => ({
      activeCard,
      setActiveCard,
      settledCardId,
      settleCard,
    }),
    [activeCard, settleCard, settledCardId],
  );

  return (
    <BoardStateContext.Provider value={value}>
      {children}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </BoardStateContext.Provider>
  );
}

export function useBoardState() {
  const context = useContext(BoardStateContext);
  invariant(context, "BoardStateContext not found");
  return context;
}
