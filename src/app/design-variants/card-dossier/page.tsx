"use client";

// Variant: Dossier. A card is a document: clicking opens a full page with a
// breadcrumb back to the board, room for the whole conversation, and a facts
// rail that carries every card action in one place.

import { ArrowLeft } from "lucide-react";
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
  boardName,
  columnNameFor,
  defaultCard,
  isCompletedCard,
  type MockCard,
  projectName,
} from "../_lib/mock-data";
import { VariantSwitcher } from "../_lib/switcher";

export default function CardDossierVariantPage() {
  const [openCard, setOpenCard] = useState<MockCard | null>(defaultCard);

  useEffect(() => {
    if (!openCard) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenCard(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openCard]);

  if (!openCard) {
    return (
      <div className="h-dvh overflow-hidden bg-background text-foreground">
        <BoardShell onSelectCard={(card) => setOpenCard(card)} />
        <VariantSwitcher active="dossier" />
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="flex h-11 shrink-0 items-center gap-3 border-b border-border px-4">
        <button
          type="button"
          onClick={() => setOpenCard(null)}
          aria-label="Back to board"
          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <nav className="flex min-w-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <span className="truncate">{projectName}</span>
          <span aria-hidden>/</span>
          <span className="truncate">{boardName}</span>
          <span aria-hidden>/</span>
          <span className="shrink-0 text-foreground">Card-{openCard.id}</span>
        </nav>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-5xl flex-col lg:flex-row lg:divide-x lg:divide-border">
          <main className="min-w-0 flex-1 px-6 py-10 lg:px-10">
            <MicroLabel>{columnNameFor(openCard)}</MicroLabel>
            <h1
              className={cn(
                "mt-3 max-w-[26ch] text-3xl font-light tracking-tight",
                isCompletedCard(openCard) &&
                  "text-muted-foreground line-through",
              )}
            >
              {openCard.title}
            </h1>
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              Opened {openCard.created}, updated {openCard.updated}
            </p>

            <div className="mt-10 flex flex-col gap-3">
              <MicroLabel>Description</MicroLabel>
              <DescriptionBody card={openCard} />
            </div>

            <div className="mt-12 border-t border-border pt-6">
              <div className="flex items-baseline gap-2">
                <MicroLabel>Comments</MicroLabel>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(openCard.thread?.length ?? 0).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-1">
                <CommentThread card={openCard} />
              </div>
              <div className="border-t border-border/60">
                <CommentComposer />
              </div>
            </div>
          </main>

          <aside className="shrink-0 border-t border-border px-6 py-8 lg:w-72 lg:border-t-0 lg:px-8 lg:py-10">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <MicroLabel>Priority</MicroLabel>
                <PriorityValue priority={openCard.priority} />
              </div>
              <div className="flex flex-col gap-1.5">
                <MicroLabel>Assignee</MicroLabel>
                <AssigneeValue card={openCard} />
              </div>
              <div className="flex flex-col gap-1.5">
                <MicroLabel>Due</MicroLabel>
                <DueValue card={openCard} />
              </div>
              <div className="flex flex-col gap-1.5">
                <MicroLabel>Labels</MicroLabel>
                <LabelChips card={openCard} />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-1 border-t border-border pt-6">
              <MicroLabel className="mb-2">Actions</MicroLabel>
              <ActionRow>Assign to me</ActionRow>
              <ActionRow>Duplicate card</ActionRow>
              <ActionRow destructive>Delete card</ActionRow>
            </div>
          </aside>
        </div>
      </div>

      <VariantSwitcher active="dossier" />
    </div>
  );
}

function ActionRow({
  children,
  destructive,
}: {
  children: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "w-fit py-1 text-left text-sm transition-colors focus-visible:outline-none",
        destructive
          ? "text-destructive/80 hover:text-destructive focus-visible:text-destructive"
          : "text-muted-foreground hover:text-foreground focus-visible:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
