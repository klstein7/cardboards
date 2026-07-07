import {
  CheckCircle2,
  MessageSquare,
  Plus,
  Search,
  Slash,
} from "lucide-react";
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
  title: "Marquee board variant | cardboards",
};

const donePercent = Math.round((doneCards / totalCards) * 100);

function ProgressMeter() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-1.5 w-56 items-stretch gap-px overflow-hidden">
        {boardColumns
          .filter((column) => column.cards.length > 0)
          .map((column) => (
            <div
              key={column.name}
              className={cn(
                "h-full",
                column.isCompleted ? "bg-primary" : "bg-foreground/20",
              )}
              style={{ flexGrow: column.cards.length }}
            />
          ))}
      </div>
      <span className="font-mono text-[11px] text-muted-foreground">
        {donePercent}% done
      </span>
    </div>
  );
}

function MarqueeEntry({
  card,
  isCompleted,
}: {
  card: MockCard;
  isCompleted?: boolean;
}) {
  return (
    <div className="group relative cursor-pointer pl-4 transition-transform duration-150 hover:-translate-y-px">
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

export default function BoardMarqueePage() {
  return (
    <VariantShell active="marquee">
      <div className="flex h-full flex-col">
        <div className="flex flex-col gap-6 border-b border-border px-6 py-7 md:px-8">
          <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-extralight tracking-tight md:text-4xl">
                {boardName}
              </h1>
              <span className="font-mono text-xs text-muted-foreground">
                {totalCards} cards · {doneCards} done
              </span>
            </div>

            <div className="flex items-center gap-5">
              <div className="hidden -space-x-1.5 sm:flex">
                {members.map((person) => (
                  <span
                    key={person.initials}
                    title={person.name}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-medium ring-2 ring-background"
                    style={avatarStyle(person)}
                  >
                    {person.initials}
                  </span>
                ))}
              </div>
              <button className="flex h-9 items-center gap-1.5 bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                New card
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
            <ProgressMeter />
            <label className="flex items-center gap-2 border-b border-border pb-1 text-muted-foreground transition-colors focus-within:border-foreground/60">
              <Search className="h-3.5 w-3.5" />
              <input
                placeholder="Search cards"
                className="w-40 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:w-52"
              />
            </label>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="flex h-full w-fit items-stretch divide-x divide-border">
            {boardColumns.map((column) => (
              <div
                key={column.name}
                className="flex h-full w-[85vw] shrink-0 flex-col sm:w-[360px]"
              >
                <div className="sticky top-0 flex items-center gap-2 bg-background px-7 pb-4 pt-6">
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
                  <span className="flex h-4 min-w-4 items-center justify-center bg-primary px-1 font-mono text-[9px] text-primary-foreground">
                    {column.cards.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto px-7 pb-6">
                  {column.cards.length > 0 ? (
                    <div className="space-y-7 pt-1">
                      {column.cards.map((card) => (
                        <MarqueeEntry
                          key={card.title}
                          card={card}
                          isCompleted={column.isCompleted}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1 flex flex-col items-center gap-2 border border-dashed border-border px-4 py-10 text-center">
                      <Slash className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-light tracking-tight">
                        Nothing blocked
                      </p>
                      <p className="max-w-[22ch] text-[11px] leading-relaxed text-muted-foreground">
                        Cards land here when work stalls on a dependency.
                      </p>
                    </div>
                  )}

                  {!column.isCompleted && (
                    <button className="mt-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
                      <Plus className="h-3.5 w-3.5" />
                      Add card
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VariantShell>
  );
}
