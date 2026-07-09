"use client";

// Variant: Inspector. The board never leaves: details dock in a right rail
// beside the live columns, with prev and next to walk the queue card by card.

import { ArrowDown, ArrowUp, X } from "lucide-react";
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
  allCards,
  columnNameFor,
  defaultCard,
  isCompletedCard,
  type MockCard,
} from "../_lib/mock-data";
import { VariantSwitcher } from "../_lib/switcher";

export default function CardInspectorVariantPage() {
  const [selected, setSelected] = useState<MockCard | null>(defaultCard);

  const index = selected
    ? allCards.findIndex((card) => card.id === selected.id)
    : -1;
  const previous = index > 0 ? allCards[index - 1] : undefined;
  const next =
    index >= 0 && index < allCards.length - 1 ? allCards[index + 1] : undefined;

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

      {selected && (
        <aside className="fixed inset-0 z-50 flex flex-col bg-background md:static md:z-auto md:w-[400px] md:shrink-0 md:border-l md:border-border">
          <header className="flex h-11 shrink-0 items-center justify-between border-b border-border px-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Card-{selected.id}
            </span>
            <div className="flex items-center gap-1">
              <RailButton
                label="Previous card"
                disabled={!previous}
                onClick={() => previous && setSelected(previous)}
              >
                <ArrowUp className="h-4 w-4" />
              </RailButton>
              <RailButton
                label="Next card"
                disabled={!next}
                onClick={() => next && setSelected(next)}
              >
                <ArrowDown className="h-4 w-4" />
              </RailButton>
              <RailButton label="Close card" onClick={() => setSelected(null)}>
                <X className="h-4 w-4" />
              </RailButton>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-5 pb-5 pt-6">
              <h2
                className={cn(
                  "text-xl font-light leading-snug tracking-tight",
                  isCompletedCard(selected) &&
                    "text-muted-foreground line-through",
                )}
              >
                {selected.title}
              </h2>
            </div>

            <dl className="divide-y divide-border/60 border-y border-border">
              <FactRow label="Status">
                <span className="text-sm">{columnNameFor(selected)}</span>
              </FactRow>
              <FactRow label="Priority">
                <PriorityValue priority={selected.priority} />
              </FactRow>
              <FactRow label="Assignee">
                <AssigneeValue card={selected} />
              </FactRow>
              <FactRow label="Due">
                <DueValue card={selected} />
              </FactRow>
              <FactRow label="Labels">
                <LabelChips card={selected} />
              </FactRow>
              <FactRow label="Created">
                <span className="font-mono text-xs text-muted-foreground">
                  {selected.created}
                </span>
              </FactRow>
              <FactRow label="Updated">
                <span className="font-mono text-xs text-muted-foreground">
                  {selected.updated}
                </span>
              </FactRow>
            </dl>

            <div className="flex flex-col gap-3 px-5 py-6">
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

      <VariantSwitcher active="inspector" placement="bottom-left" />
    </div>
  );
}

function RailButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function FactRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-2.5">
      <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="flex min-w-0 justify-end text-right">{children}</dd>
    </div>
  );
}
