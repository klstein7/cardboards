"use client";

// Variant: Workbench. The docked panel becomes half the screen: a two-column
// workspace with the document beside a facts rail, for deep editing without
// leaving the board.

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
  columnNameFor,
  defaultCard,
  isCompletedCard,
  type MockCard,
} from "../_lib/mock-data";
import { VariantSwitcher } from "../_lib/switcher";

export default function CardWorkbenchVariantPage() {
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
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <BoardShell
        selectedId={selected?.id}
        onSelectCard={(card) => setSelected(card)}
        className="min-w-0 flex-1"
      />

      {selected && (
        <aside className="fixed inset-0 z-50 flex flex-col bg-background md:static md:z-auto md:w-1/2 md:shrink-0 md:border-l md:border-border xl:w-[680px]">
          <header className="flex h-11 shrink-0 items-center justify-between border-b border-border px-5">
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em]">
              <span className="text-muted-foreground">Card-{selected.id}</span>
              <span className="text-foreground">{columnNameFor(selected)}</span>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close card"
              className="text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[1fr_220px] md:divide-x md:divide-border md:overflow-y-visible">
            <div className="min-w-0 px-5 py-6 md:overflow-y-auto md:px-7">
              <h2
                className={cn(
                  "text-2xl font-light leading-snug tracking-tight",
                  isCompletedCard(selected) &&
                    "text-muted-foreground line-through",
                )}
              >
                {selected.title}
              </h2>

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

            <aside className="flex flex-col gap-6 border-t border-border px-5 py-6 md:overflow-y-auto md:border-t-0">
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
        </aside>
      )}

      <VariantSwitcher active="workbench" placement="bottom-left" />
    </div>
  );
}
