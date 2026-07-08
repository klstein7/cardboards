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
  projectName,
  totalCards,
} from "../_lib/mock-data";
import { VariantSwitcher } from "../_lib/switcher";

export const metadata: Metadata = {
  title: "Ledger | Board design variants",
};

const labelFilters = ["Bug", "Design", "Feature", "Performance"];
const donePercent = Math.round((doneCards / totalCards) * 100);

function LedgerRow({
  card,
  isCompleted,
}: {
  card: MockCard;
  isCompleted?: boolean;
}) {
  return (
    <div className="group flex cursor-pointer items-center gap-2.5 px-3 py-2 transition-colors hover:bg-accent/50">
      <span
        className="h-3 w-0.5 shrink-0"
        style={{
          backgroundColor: isCompleted
            ? "hsl(var(--border))"
            : priorityColor[card.priority],
        }}
        aria-hidden
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[12.5px] transition-colors group-hover:text-primary",
          isCompleted &&
            "text-muted-foreground line-through group-hover:text-muted-foreground",
        )}
      >
        {card.title}
      </span>
      {card.due && (
        <span
          className={cn(
            "shrink-0 font-mono text-[9px]",
            card.overdue ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {card.due}
        </span>
      )}
      <span className="shrink-0 border border-border px-1.5 py-0.5 font-mono text-[9px] leading-none text-muted-foreground">
        {card.label}
      </span>
      {card.assignee ? (
        <MemberAvatar
          person={card.assignee}
          className="h-4 w-4 text-[8px]"
        />
      ) : (
        <span className="h-4 w-4 shrink-0" aria-hidden />
      )}
    </div>
  );
}

function LedgerLane({ column }: { column: MockColumn }) {
  const count = column.cards.length;
  return (
    <section className="flex h-full min-w-0 flex-col">
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {column.name}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {String(count).padStart(2, "0")}
        </span>
      </header>
      <div className="min-h-0 flex-1 divide-y divide-border/60 overflow-y-auto">
        {count > 0 ? (
          column.cards.map((card) => (
            <LedgerRow
              key={card.title}
              card={card}
              isCompleted={column.isCompleted}
            />
          ))
        ) : (
          <p className="px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            No entries
          </p>
        )}
      </div>
      <footer className="shrink-0 border-t border-border">
        <button className="flex h-8 w-full items-center gap-1.5 px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary">
          <Plus className="h-3 w-3" />
          Add
        </button>
      </footer>
    </section>
  );
}

export default function LedgerPage() {
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="flex h-12 shrink-0 items-stretch border-b border-border">
        <div className="flex items-center border-r border-border px-3.5">
          <BrandIcon variant="xsmall" />
        </div>
        <button className="flex min-w-0 items-center gap-2 border-r border-border px-4 text-sm transition-colors hover:bg-accent">
          <span className="hidden text-muted-foreground sm:inline">
            {projectName}
          </span>
          <span className="hidden text-border sm:inline">/</span>
          <span className="truncate font-medium">{boardName}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
        <div className="hidden items-center gap-4 px-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:flex">
          <span>{totalCards} cards</span>
          <span>{doneCards} done</span>
          <span className="text-primary">{donePercent}%</span>
        </div>
        <div className="min-w-0 flex-1" />
        <div className="hidden items-center gap-2 px-4 lg:flex">
          {labelFilters.map((label) => (
            <button
              key={label}
              className="border border-border px-1.5 py-1 font-mono text-[9px] uppercase leading-none tracking-wider text-muted-foreground transition-colors hover:border-foreground/60 hover:text-foreground"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="hidden items-center border-l border-border px-4 xl:flex">
          <MemberStack people={members} itemClassName="h-6 w-6 text-[9px]" />
        </div>
        <button
          aria-label="Notifications"
          className="flex w-12 items-center justify-center border-l border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-center border-l border-border px-3">
          <button className="flex h-8 items-center gap-1.5 bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" />
            New card
          </button>
        </div>
        <div className="flex items-center border-l border-border px-3">
          <MemberAvatar person={maren} className="h-7 w-7 text-[10px]" />
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-x-auto">
        <div className="grid h-full auto-cols-[minmax(280px,1fr)] grid-flow-col divide-x divide-border">
          {boardColumns.map((column) => (
            <LedgerLane key={column.name} column={column} />
          ))}
        </div>
      </main>

      <VariantSwitcher active="ledger" />
    </div>
  );
}
