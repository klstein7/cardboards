"use client";

// Variant: Docket. The tightest rail: a dense fact ledger up top and tabbed
// Details and Comments panes below, so nothing scrolls past what you are not
// reading.

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
  PriorityValue,
} from "../_lib/detail-bits";
import {
  columnNameFor,
  defaultCard,
  isCompletedCard,
  type MockCard,
} from "../_lib/mock-data";
import { VariantSwitcher } from "../_lib/switcher";

type DocketTab = "details" | "comments";

export default function CardDocketVariantPage() {
  const [selected, setSelected] = useState<MockCard | null>(defaultCard);
  const [tab, setTab] = useState<DocketTab>("details");

  const selectCard = (card: MockCard) => {
    setSelected(card);
    setTab("details");
  };

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
        onSelectCard={selectCard}
        className="min-w-0 flex-1"
      />

      {selected && (
        <aside className="fixed inset-0 z-50 flex flex-col bg-background md:static md:z-auto md:w-[360px] md:shrink-0 md:border-l md:border-border">
          <header className="flex h-11 shrink-0 items-center justify-between border-b border-border px-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Card-{selected.id}
            </span>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close card"
              className="text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="shrink-0 px-4 pb-5 pt-5">
            <h2
              className={cn(
                "text-lg font-light leading-snug tracking-tight",
                isCompletedCard(selected) &&
                  "text-muted-foreground line-through",
              )}
            >
              {selected.title}
            </h2>

            <dl className="mt-4 grid grid-cols-[84px_1fr] items-center gap-y-2.5">
              <DocketFact label="Status">
                <span className="text-sm">{columnNameFor(selected)}</span>
              </DocketFact>
              <DocketFact label="Priority">
                <PriorityValue priority={selected.priority} />
              </DocketFact>
              <DocketFact label="Assignee">
                <AssigneeValue card={selected} />
              </DocketFact>
              <DocketFact label="Due">
                <DueValue card={selected} />
              </DocketFact>
              <DocketFact label="Labels">
                <LabelChips card={selected} />
              </DocketFact>
            </dl>
          </div>

          <div className="flex shrink-0 gap-5 border-b border-border px-4">
            <DocketTabButton
              label="Details"
              isActive={tab === "details"}
              onClick={() => setTab("details")}
            />
            <DocketTabButton
              label="Comments"
              count={selected.thread?.length ?? 0}
              isActive={tab === "comments"}
              onClick={() => setTab("comments")}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
            {tab === "details" ? (
              <div className="flex flex-col gap-5">
                <DescriptionBody card={selected} />
                <p className="border-t border-border/60 pt-4 font-mono text-[10px] text-muted-foreground">
                  Created {selected.created}, updated {selected.updated}
                </p>
              </div>
            ) : (
              <div>
                <CommentThread card={selected} />
                <div className="border-t border-border/60">
                  <CommentComposer />
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      <VariantSwitcher active="docket" placement="bottom-left" />
    </div>
  );
}

function DocketFact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0">{children}</dd>
    </>
  );
}

function DocketTabButton({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-mb-px flex items-baseline gap-1.5 border-b-2 pb-2 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors focus-visible:outline-none",
        isActive
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground focus-visible:text-foreground",
      )}
    >
      {label}
      {count !== undefined && (
        <span className="font-mono text-[10px] normal-case tracking-normal text-muted-foreground">
          {String(count).padStart(2, "0")}
        </span>
      )}
    </button>
  );
}
