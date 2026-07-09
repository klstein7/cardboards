"use client";

// The workbench panel chrome shared by the round-seven interior variants:
// the docked half-screen aside with its header strip. Each variant supplies
// only the interior.

import { X } from "lucide-react";

import { columnNameFor, type MockCard } from "./mock-data";

export function PanelFrame({
  card,
  onClose,
  children,
}: {
  card: MockCard;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <aside className="fixed inset-0 z-50 flex flex-col bg-background md:static md:z-auto md:w-1/2 md:shrink-0 md:border-l md:border-border xl:w-[680px]">
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-border px-5">
        <div className="flex min-w-0 items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em]">
          <span className="shrink-0 text-muted-foreground">Card-{card.id}</span>
          <span className="truncate text-foreground">{columnNameFor(card)}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close card"
          className="text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </header>
      {children}
    </aside>
  );
}
