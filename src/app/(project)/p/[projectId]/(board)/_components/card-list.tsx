// src/app/(project)/p/[projectId]/(board)/_components/card-list.tsx
"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Inbox } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useCards } from "~/lib/hooks";

import { CardItem } from "./card-item";
import { CardSkeleton } from "./card-skeleton";

interface CardListProps {
  columnId: string;
  isCompleted: boolean;
}

export function CardList({ columnId, isCompleted }: CardListProps) {
  const cards = useCards(columnId);
  const reduceMotion = useReducedMotion();
  const emptyLabel = isCompleted ? "Nothing completed" : "No entries";

  if (cards.error) {
    return (
      <div className="p-3.5">
        <div className="border border-dashed border-border px-4 py-7">
          <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden />
          <h3 className="mt-4 text-sm font-medium">Cards could not load</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {cards.error.message}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => void cards.refetch()}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (cards.isPending)
    return (
      <div className="flex flex-col divide-y divide-border/60">
        {[0, 1, 2].map((index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );

  if (!cards.data.length)
    return (
      <div className="p-3.5">
        <div className="border border-dashed border-border px-4 py-7">
          <Inbox className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h3 className="mt-4 text-sm font-light tracking-tight">
            {emptyLabel}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {isCompleted
              ? "Completed cards will appear here."
              : "Add a card below, or move work into this lane."}
          </p>
        </div>
      </div>
    );

  const sortedCards = [...cards.data].sort((a, b) => a.order - b.order);

  return (
    <div className="flex max-w-full flex-col divide-y divide-border/60">
      <AnimatePresence initial={false}>
        {sortedCards.map((card, index) => (
          <motion.div
            key={card.id}
            layout="position"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    duration: 0.16,
                    layout: {
                      type: "spring",
                      stiffness: 520,
                      damping: 42,
                      mass: 0.7,
                    },
                  }
            }
          >
            <CardItem
              card={card}
              index={index}
              columnId={columnId}
              isCompleted={isCompleted}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
