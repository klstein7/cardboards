"use client";

// Variant: Sheet. The overlay stays, but rebuilt in the Ledger language: a
// sharp bordered sheet raised over the dimmed board, document on the left,
// facts in a hairline rail on the right.

import { X } from "lucide-react";
import { useEffect, useState } from "react";

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
  columnNameFor,
  defaultCard,
  isCompletedCard,
  type MockCard,
} from "../_lib/mock-data";
import { VariantSwitcher } from "../_lib/switcher";

export default function CardSheetVariantPage() {
  const [selected, setSelected] = useState<MockCard | null>(defaultCard);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  return (
    <div className="h-dvh overflow-hidden bg-background text-foreground">
      <BoardShell
        selectedId={selected?.id}
        onSelectCard={(card) => setSelected(card)}
      />

      {selected && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-background/80 md:px-6 md:py-12"
          onClick={() => setSelected(null)}
        >
          <div
            className="mx-auto flex min-h-dvh w-full flex-col border-border bg-popover md:min-h-0 md:max-w-3xl md:border"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Card ${selected.id}: ${selected.title}`}
          >
            <header className="flex h-11 shrink-0 items-center justify-between border-b border-border px-5">
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em]">
                <span className="text-muted-foreground">
                  Card-{selected.id}
                </span>
                <span className="text-foreground">
                  {columnNameFor(selected)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                aria-label="Close card"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="grid flex-1 md:grid-cols-[1fr_240px] md:divide-x md:divide-border">
              <div className="px-5 py-6 md:px-8 md:py-8">
                <h1
                  className={
                    isCompletedCard(selected)
                      ? "text-2xl font-light tracking-tight text-muted-foreground line-through"
                      : "text-2xl font-light tracking-tight"
                  }
                >
                  {selected.title}
                </h1>

                <div className="mt-6 flex flex-col gap-3">
                  <MicroLabel>Description</MicroLabel>
                  <DescriptionBody card={selected} />
                </div>

                <div className="mt-8 border-t border-border pt-5">
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

              <aside className="flex flex-col gap-6 border-t border-border px-5 py-6 md:border-t-0 md:px-6 md:py-8">
                <div className="flex flex-col gap-1.5">
                  <MicroLabel>Status</MicroLabel>
                  <span className="text-sm">{columnNameFor(selected)}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <MicroLabel>Priority</MicroLabel>
                  <PriorityValue priority={selected.priority} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <MicroLabel>Assignee</MicroLabel>
                  <AssigneeValue card={selected} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <MicroLabel>Due</MicroLabel>
                  <DueValue card={selected} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <MicroLabel>Labels</MicroLabel>
                  <LabelChips card={selected} />
                </div>
                <div className="flex flex-col gap-1.5 border-t border-border pt-5">
                  <MicroLabel>Created</MicroLabel>
                  <span className="font-mono text-xs text-muted-foreground">
                    {selected.created}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <MicroLabel>Updated</MicroLabel>
                  <span className="font-mono text-xs text-muted-foreground">
                    {selected.updated}
                  </span>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}

      <VariantSwitcher active="sheet" />
    </div>
  );
}
