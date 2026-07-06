import {
  CheckCircle2,
  ChevronDown,
  MessageSquare,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import { type Metadata } from "next";

import { cn } from "~/lib/utils";

import {
  avatarStyle,
  boardColumns,
  boardName,
  doneCards,
  type MockCard,
  priorityColor,
  totalCards,
} from "../_lib/mock-data";
import { VariantShell } from "../_lib/variant-shell";

export const metadata: Metadata = {
  title: "Slab board variant | cardboards",
};

const FILTERS = ["All cards", "Mine", "Due soon"];

function SlabCard({
  card,
  isCompleted,
}: {
  card: MockCard;
  isCompleted?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative cursor-grab border border-border bg-popover p-3 transition-all hover:-translate-y-px hover:border-muted-foreground/40",
        isCompleted && "opacity-60",
      )}
    >
      <span
        className="absolute left-0 top-0 h-0.5 w-8"
        style={{
          backgroundColor: isCompleted
            ? "hsl(var(--border))"
            : priorityColor[card.priority],
        }}
      />
      <h3
        className={cn(
          "text-[13px] font-medium leading-snug",
          isCompleted && "text-muted-foreground line-through",
        )}
      >
        {card.title}
      </h3>
      <div className="mt-2.5 flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
        <span className="bg-muted px-1.5 py-0.5">{card.label}</span>
        {card.due && (
          <span className={cn(card.overdue && "text-destructive")}>
            {card.due}
          </span>
        )}
        <span className="ml-auto flex items-center gap-2.5">
          {card.comments && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {card.comments}
            </span>
          )}
          {card.assignee && (
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full text-[8px]"
              style={avatarStyle(card.assignee)}
            >
              {card.assignee.initials}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

export default function BoardSlabPage() {
  return (
    <VariantShell active="slab">
      <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border px-4 py-3 md:px-6">
          <button className="flex items-center gap-1.5 text-sm font-medium hover:text-primary">
            {boardName}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          <div className="flex items-center border border-border">
            {FILTERS.map((filter, index) => (
              <button
                key={filter}
                className={cn(
                  "h-8 px-3 text-sm transition-colors",
                  index === 0
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-5">
            <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
              {doneCards} of {totalCards} done
            </span>
            <button className="flex h-8 items-center gap-1.5 border border-border px-3 text-sm hover:border-foreground/60">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Board settings</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex h-full w-fit items-stretch gap-3">
            {boardColumns.map((column) => (
              <div
                key={column.name}
                className="flex h-full w-[min(calc(100vw-2rem),300px)] shrink-0 flex-col border border-border bg-muted/30"
              >
                <div className="flex items-center gap-2 px-3 pb-2 pt-3">
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
                  <span className="ml-auto font-mono text-[11px] text-primary">
                    {column.cards.length}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
                  {column.cards.map((card) => (
                    <SlabCard
                      key={card.title}
                      card={card}
                      isCompleted={column.isCompleted}
                    />
                  ))}
                </div>

                {column.isCompleted ? (
                  <div className="flex items-center gap-1.5 px-3 pb-3 pt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed
                  </div>
                ) : (
                  <button className="mx-2 mb-2 flex h-8 items-center gap-1.5 px-1 text-sm text-muted-foreground hover:text-primary">
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
