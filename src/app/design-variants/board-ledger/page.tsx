import { CheckCircle2, MessageSquare, Plus, Search } from "lucide-react";
import { type Metadata } from "next";

import { cn } from "~/lib/utils";

import {
  avatarStyle,
  boardColumns,
  boardName,
  doneCards,
  members,
  type MockCard,
  priorityColor,
  totalCards,
} from "../_lib/mock-data";
import { VariantShell } from "../_lib/variant-shell";

export const metadata: Metadata = {
  title: "Ledger board variant | cardboards",
};

function LedgerEntry({
  card,
  isCompleted,
}: {
  card: MockCard;
  isCompleted?: boolean;
}) {
  return (
    <div className="group relative cursor-pointer pl-4">
      <span
        className="absolute left-0 top-[3px] h-3.5 w-0.5"
        style={{
          backgroundColor: isCompleted
            ? "hsl(var(--border))"
            : priorityColor[card.priority],
        }}
      />
      <h3
        className={cn(
          "text-[13px] font-medium leading-snug transition-colors group-hover:text-primary",
          isCompleted && "text-muted-foreground line-through",
        )}
      >
        {card.title}
      </h3>
      <div className="mt-1.5 flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
        <span>{card.label}</span>
        {card.due && (
          <span className={cn(card.overdue && "text-destructive")}>
            {card.due}
          </span>
        )}
        {card.comments && (
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {card.comments}
          </span>
        )}
        {card.assignee && (
          <span
            className="ml-auto flex h-4 w-4 items-center justify-center rounded-full text-[8px]"
            style={avatarStyle(card.assignee)}
          >
            {card.assignee.initials}
          </span>
        )}
      </div>
    </div>
  );
}

export default function BoardLedgerPage() {
  return (
    <VariantShell active="ledger">
      <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-border px-6 py-5">
          <div className="flex items-baseline gap-4">
            <h1 className="text-2xl font-light tracking-tight">{boardName}</h1>
            <span className="font-mono text-xs text-muted-foreground">
              {totalCards} cards · {doneCards} done
            </span>
          </div>

          <div className="ml-auto flex items-center gap-6">
            <label className="hidden items-center gap-2 border-b border-border pb-1 text-muted-foreground focus-within:border-foreground/60 sm:flex">
              <Search className="h-3.5 w-3.5" />
              <input
                placeholder="Search cards"
                className="w-44 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </label>

            <div className="flex -space-x-1.5">
              {members.map((person) => (
                <span
                  key={person.initials}
                  title={person.name}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-medium ring-2 ring-background"
                  style={avatarStyle(person)}
                >
                  {person.initials}
                </span>
              ))}
            </div>

            <button className="flex h-8 items-center gap-1.5 bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="h-3.5 w-3.5" />
              New card
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="flex h-full w-fit items-stretch divide-x divide-border">
            {boardColumns.map((column) => (
              <div
                key={column.name}
                className="flex h-full w-[min(100vw,340px)] shrink-0 flex-col px-6 py-5"
              >
                <div className="flex items-center gap-2 pb-5">
                  {column.isCompleted && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span
                    className={cn(
                      "text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
                      column.isCompleted && "text-primary",
                    )}
                  >
                    {column.name}
                  </span>
                  <span className="font-mono text-[11px] text-primary">
                    {column.cards.length}
                  </span>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto">
                  {column.cards.map((card) => (
                    <LedgerEntry
                      key={card.title}
                      card={card}
                      isCompleted={column.isCompleted}
                    />
                  ))}
                </div>

                {!column.isCompleted && (
                  <button className="mt-5 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                    <Plus className="h-3.5 w-3.5" />
                    Add card
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </VariantShell>
  );
}
