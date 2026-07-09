"use client";

// Variant: Queue. The rail carries the active column's queue inside it: a
// jump list at the top, the open card's detail below, built for working a
// column top to bottom without touching the board.

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "~/lib/utils";

import { BoardShell } from "../_lib/board-shell";
import {
  AssigneeValue,
  CommentComposer,
  CommentThread,
  DescriptionBody,
  DueValue,
  LabelChips,
  MicroLabel,
  PriorityValue,
} from "../_lib/detail-bits";
import {
  boardColumns,
  defaultCard,
  type MockCard,
  priorityColor,
} from "../_lib/mock-data";
import { VariantSwitcher } from "../_lib/switcher";

export default function CardQueueVariantPage() {
  const [selected, setSelected] = useState<MockCard | null>(defaultCard);

  const column = selected
    ? boardColumns.find((entry) =>
        entry.cards.some((card) => card.id === selected.id),
      )
    : undefined;
  const positionInColumn = column
    ? column.cards.findIndex((card) => card.id === selected?.id) + 1
    : 0;

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <BoardShell
        selectedId={selected?.id}
        onSelectCard={(card) => setSelected(card)}
        className="min-w-0 flex-1"
      />

      {selected && column && (
        <aside className="fixed inset-0 z-50 flex flex-col bg-background md:static md:z-auto md:w-[420px] md:shrink-0 md:border-l md:border-border">
          <header className="flex h-11 shrink-0 items-center justify-between border-b border-border px-4">
            <span className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {column.name}
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">
                {String(positionInColumn).padStart(2, "0")} /{" "}
                {String(column.cards.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close card"
                className="text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="max-h-48 shrink-0 overflow-y-auto border-b border-border">
            <div className="flex flex-col divide-y divide-border/60">
              {column.cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSelected(card)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-4 py-2 text-left transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none",
                    card.id === selected.id && "bg-accent/50",
                  )}
                >
                  <span
                    className="h-3 w-0.5 shrink-0"
                    style={{
                      backgroundColor: column.isCompleted
                        ? "hsl(var(--border))"
                        : priorityColor[card.priority],
                    }}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-[13px]",
                      card.id === selected.id
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {card.title}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {card.id}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-5 pb-5 pt-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Card-{selected.id}
              </span>
              <h2
                className={cn(
                  "mt-2 text-xl font-light leading-snug tracking-tight",
                  column.isCompleted && "text-muted-foreground line-through",
                )}
              >
                {selected.title}
              </h2>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                <PriorityValue priority={selected.priority} />
                <DueValue card={selected} />
                <AssigneeValue card={selected} />
                <LabelChips card={selected} />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-border px-5 py-6">
              <MicroLabel>Description</MicroLabel>
              <DescriptionBody card={selected} />
            </div>

            <div className="border-t border-border px-5 py-6">
              <div className="flex items-baseline gap-2">
                <MicroLabel>Comments</MicroLabel>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(selected.thread?.length ?? 0).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-1">
                <CommentThread card={selected} />
              </div>
              <div className="border-t border-border/60">
                <CommentComposer />
              </div>
            </div>
          </div>
        </aside>
      )}

      <VariantSwitcher active="queue" placement="bottom-left" />
    </div>
  );
}
