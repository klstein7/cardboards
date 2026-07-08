import { Bell, ChevronsUpDown, Plus } from "lucide-react";
import { type Metadata } from "next";

import { BrandIcon } from "~/components/brand/brand-icon";
import { cn } from "~/lib/utils";

import { MemberAvatar, MemberStack } from "../_lib/bits";
import {
  boardColumns,
  boardName,
  doneCards,
  maren,
  members,
  type MockCard,
  type MockColumn,
  priorityColor,
  totalCards,
} from "../_lib/mock-data";
import { VariantSwitcher } from "../_lib/switcher";

export const metadata: Metadata = {
  title: "Baseline | Board design variants",
};

function laneId(name: string): string {
  return `lane-${name.toLowerCase().replace(/\s+/g, "-")}`;
}

function BaselineCard({
  card,
  isCompleted,
}: {
  card: MockCard;
  isCompleted?: boolean;
}) {
  return (
    <article className="group -mx-5 cursor-pointer px-5 py-2.5 transition-colors hover:bg-primary/[0.04]">
      <div className="relative pl-4">
        <span
          className="absolute left-0 top-[3px] h-3.5 w-0.5"
          style={{
            backgroundColor: isCompleted
              ? "hsl(var(--border))"
              : priorityColor[card.priority],
          }}
          aria-hidden
        />
        <h3
          className={cn(
            "text-[13px] font-medium leading-snug transition-colors group-hover:text-primary",
            isCompleted &&
              "text-muted-foreground line-through group-hover:text-muted-foreground",
          )}
        >
          {card.title}
        </h3>
        <div className="mt-2 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <span className="border border-border px-1.5 py-0.5 leading-none">
            {card.label}
          </span>
          {card.due && (
            <span className={cn(card.overdue && "text-destructive")}>
              {card.due}
            </span>
          )}
          {card.assignee && (
            <MemberAvatar person={card.assignee} className="ml-auto" />
          )}
        </div>
      </div>
    </article>
  );
}

function BaselineLane({ column }: { column: MockColumn }) {
  return (
    <section id={laneId(column.name)} className="flex h-full min-w-0 flex-col">
      <header className="flex shrink-0 items-baseline justify-between px-5 pb-3 pt-5">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {column.name}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {column.cards.length}
        </span>
      </header>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-5 pb-4">
        {column.cards.length > 0 ? (
          column.cards.map((card) => (
            <BaselineCard
              key={card.title}
              card={card}
              isCompleted={column.isCompleted}
            />
          ))
        ) : (
          <p className="max-w-[26ch] pt-0.5 text-[13px] leading-relaxed text-muted-foreground">
            No cards in {column.name.toLowerCase()}. Move one here or add one
            below.
          </p>
        )}
      </div>
      <footer className="shrink-0 px-5 pb-4 pt-1">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
          <Plus className="h-3.5 w-3.5" />
          Add card
        </button>
      </footer>
    </section>
  );
}

export default function BaselinePage() {
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <main className="min-h-0 flex-1 overflow-x-auto">
        <div className="grid h-full auto-cols-[minmax(300px,1fr)] grid-flow-col divide-x divide-border">
          {boardColumns.map((column) => (
            <BaselineLane key={column.name} column={column} />
          ))}
        </div>
      </main>

      <footer className="grid h-14 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 border-t border-border px-3 md:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <BrandIcon variant="xsmall" />
          <div className="h-6 w-px bg-border" aria-hidden />
          <button className="group flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-medium transition-colors group-hover:text-primary">
              {boardName}
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>
          <span className="hidden shrink-0 font-mono text-[10px] text-muted-foreground sm:inline">
            {doneCards}/{totalCards} done
          </span>
        </div>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Board stages"
        >
          {boardColumns.map((column) => (
            <a
              key={column.name}
              href={`#${laneId(column.name)}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {column.name}
              <span className="text-foreground/80">{column.cards.length}</span>
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 justify-self-end">
          <MemberStack people={members} className="hidden md:flex" />
          <button
            aria-label="Notifications"
            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button className="flex h-8 items-center gap-1.5 border border-primary px-3 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
            <Plus className="h-3.5 w-3.5" />
            New card
          </button>
          <MemberAvatar person={maren} className="h-7 w-7 text-[10px]" />
        </div>
      </footer>

      <VariantSwitcher active="baseline" placement="top" />
    </div>
  );
}
