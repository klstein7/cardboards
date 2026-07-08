import { Bell, ChevronDown, MessageSquare, Plus } from "lucide-react";
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
  title: "Folio | Board design variants",
};

const labelFilters = ["All", "Bug", "Design", "Feature", "Performance"];

function FolioCard({
  card,
  isCompleted,
}: {
  card: MockCard;
  isCompleted?: boolean;
}) {
  return (
    <article className="group cursor-pointer">
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
        <div className="mt-1.5 flex items-center gap-2.5 font-mono text-[10px] text-muted-foreground">
          <span>{card.label}</span>
          {card.due && (
            <span className={cn(card.overdue && "text-destructive")}>
              {card.due}
            </span>
          )}
          {card.comments != null && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" strokeWidth={1.5} />
              {card.comments}
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

function FolioLane({ column }: { column: MockColumn }) {
  return (
    <section className="flex h-full w-[272px] shrink-0 snap-start flex-col md:w-[300px]">
      <header className="flex items-baseline justify-between pb-6">
        <h2 className="text-lg font-light tracking-tight">{column.name}</h2>
        <span className="font-mono text-[10px] text-muted-foreground">
          {column.cards.length}
        </span>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        {column.cards.length > 0 ? (
          <div className="space-y-7">
            {column.cards.map((card) => (
              <FolioCard
                key={card.title}
                card={card}
                isCompleted={column.isCompleted}
              />
            ))}
          </div>
        ) : (
          <p className="max-w-[24ch] text-[13px] leading-relaxed text-muted-foreground">
            Nothing is {column.name.toLowerCase()} right now. Move a card here
            or add one below.
          </p>
        )}
      </div>
      <footer className="pt-4">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
          <Plus className="h-3.5 w-3.5" />
          Add card
        </button>
      </footer>
    </section>
  );
}

export default function FolioPage() {
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="shrink-0 border-b border-border px-6 pt-5 md:px-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <BrandIcon variant="xsmall" />
            <span>{projectName}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              aria-label="Notifications"
              className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
            </button>
            <MemberAvatar person={maren} className="h-7 w-7 text-[10px]" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-10 gap-y-4">
          <button className="group flex items-baseline gap-3 text-left">
            <h1 className="text-4xl font-light tracking-tight md:text-5xl">
              {boardName}
            </h1>
            <ChevronDown className="h-4 w-4 shrink-0 self-center text-muted-foreground transition-colors group-hover:text-primary" />
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {totalCards} cards · {doneCards} done
          </p>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 pb-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.14em]">
            {labelFilters.map((label, index) => (
              <button
                key={label}
                className={cn(
                  "transition-colors",
                  index === 0
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-5">
            <MemberStack people={members} />
            <button className="flex h-9 items-center gap-1.5 border border-primary px-4 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
              <Plus className="h-3.5 w-3.5" />
              New card
            </button>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full snap-x gap-12 px-6 py-8 md:gap-20 md:px-12">
          {boardColumns.map((column) => (
            <FolioLane key={column.name} column={column} />
          ))}
        </div>
      </main>

      <VariantSwitcher active="folio" />
    </div>
  );
}
