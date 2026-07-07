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
  title: "Frame board variant | cardboards",
};

function FrameTile({
  card,
  isCompleted,
}: {
  card: MockCard;
  isCompleted?: boolean;
}) {
  return (
    <div
      className="group cursor-pointer border border-border bg-background p-3 transition-all duration-150 hover:-translate-y-px hover:border-foreground/40"
      style={{
        borderTopWidth: "2px",
        borderTopColor: isCompleted
          ? "hsl(var(--border))"
          : priorityColor[card.priority],
      }}
    >
      <h3
        className={cn(
          "text-[13px] font-medium leading-snug transition-colors group-hover:text-primary",
          isCompleted && "text-muted-foreground line-through",
        )}
      >
        {card.title}
      </h3>
      <div className="mt-2.5 flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
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
            className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[9px]"
            style={avatarStyle(card.assignee)}
          >
            {card.assignee.initials}
          </span>
        )}
      </div>
    </div>
  );
}

export default function BoardFramePage() {
  return (
    <VariantShell active="frame">
      <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-border px-6 py-5 md:px-8">
          <div className="flex items-baseline gap-4">
            <h1 className="text-2xl font-light tracking-tight">{boardName}</h1>
            <span className="font-mono text-xs text-muted-foreground">
              {totalCards} cards · {doneCards} done
            </span>
          </div>

          <div className="ml-auto flex items-center gap-5">
            <label className="hidden items-center gap-2 border-b border-border pb-1 text-muted-foreground transition-colors focus-within:border-foreground/60 sm:flex">
              <Search className="h-3.5 w-3.5" />
              <input
                placeholder="Search cards"
                className="w-44 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </label>
            <div className="hidden -space-x-1.5 sm:flex">
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
            <button className="flex h-8 items-center gap-1.5 bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <Plus className="h-3.5 w-3.5" />
              New card
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto px-4 py-5 md:px-6">
          <div className="flex h-full w-fit items-stretch gap-4">
            {boardColumns.map((column) => (
              <div
                key={column.name}
                className="flex h-full w-[85vw] shrink-0 flex-col sm:w-[300px]"
              >
                <div className="flex items-center gap-2 px-1 pb-4">
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

                <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto pb-2">
                  {column.cards.length > 0 ? (
                    column.cards.map((card) => (
                      <FrameTile
                        key={card.title}
                        card={card}
                        isCompleted={column.isCompleted}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 border border-dashed border-border px-4 py-10 text-center">
                      <p className="text-sm font-light tracking-tight">
                        No blockers
                      </p>
                      <p className="max-w-[22ch] text-[11px] leading-relaxed text-muted-foreground">
                        Stalled cards surface here as their own frame.
                      </p>
                    </div>
                  )}

                  {!column.isCompleted && (
                    <button className="flex items-center justify-center gap-1.5 border border-dashed border-border py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
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
