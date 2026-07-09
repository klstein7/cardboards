"use client";

// The shared board scene behind every card-detail variant: the Ledger board
// with the current card entry design, so each direction is judged against
// the app as it really looks.

import { cn } from "~/lib/utils";

import { MemberAvatar } from "./bits";
import {
  boardColumns,
  boardName,
  doneCards,
  type MockCard,
  type MockColumn,
  priorityColor,
  projectName,
  totalCards,
} from "./mock-data";

interface BoardShellProps {
  selectedId?: number | null;
  onSelectCard: (card: MockCard) => void;
  className?: string;
}

export function BoardShell({
  selectedId,
  onSelectCard,
  className,
}: BoardShellProps) {
  const donePercent = Math.round((doneCards / totalCards) * 100);

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-background", className)}>
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {projectName}
          </span>
          <span className="truncate text-sm font-medium">{boardName}</span>
        </div>
        <div className="flex shrink-0 items-center gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <span>{totalCards} cards</span>
          <span>{doneCards} done</span>
          <span className="text-primary">{donePercent}%</span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 divide-x divide-border overflow-x-auto">
        {boardColumns.map((column) => (
          <BoardColumn
            key={column.name}
            column={column}
            selectedId={selectedId}
            onSelectCard={onSelectCard}
          />
        ))}
      </div>
    </div>
  );
}

function BoardColumn({
  column,
  selectedId,
  onSelectCard,
}: {
  column: MockColumn;
  selectedId?: number | null;
  onSelectCard: (card: MockCard) => void;
}) {
  const emptyLabel = column.isCompleted ? "Nothing completed" : "No entries";

  return (
    <section className="flex h-full w-[260px] shrink-0 flex-col lg:w-auto lg:min-w-[220px] lg:flex-1">
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
        <span className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {column.name}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {String(column.cards.length).padStart(2, "0")}
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {column.cards.length === 0 ? (
          <p className="px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {emptyLabel}
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border/60">
            {column.cards.map((card) => (
              <BoardCardEntry
                key={card.id}
                card={card}
                isCompleted={column.isCompleted ?? false}
                isSelected={card.id === selectedId}
                onSelect={() => onSelectCard(card)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function BoardCardEntry({
  card,
  isCompleted,
  isSelected,
  onSelect,
}: {
  card: MockCard;
  isCompleted: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const preview = !isCompleted ? card.body?.[0] : undefined;
  const hasMeta = !!card.due || !!card.label || !!card.assignee;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group/card flex w-full items-stretch gap-3 px-3.5 py-3 text-left transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none",
        isSelected && "bg-accent/50",
      )}
    >
      <span
        className="w-0.5 shrink-0"
        style={{
          backgroundColor: isCompleted
            ? "hsl(var(--border))"
            : priorityColor[card.priority],
        }}
        aria-hidden
      />

      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span
          className={cn(
            "line-clamp-2 text-sm leading-snug transition-colors",
            isCompleted
              ? "text-muted-foreground line-through"
              : "text-card-foreground group-hover/card:text-primary",
            isSelected && !isCompleted && "text-primary",
          )}
        >
          {card.title}
        </span>

        {preview && (
          <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {preview}
          </span>
        )}

        {hasMeta && (
          <span className="mt-0.5 flex items-center gap-2">
            {card.due && (
              <span
                className={cn(
                  "shrink-0 font-mono text-[10px]",
                  card.overdue ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {card.due}
              </span>
            )}
            {card.label && (
              <span className="min-w-0 truncate border border-border px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground">
                {card.label}
              </span>
            )}
            {card.assignee && (
              <MemberAvatar person={card.assignee} className="ml-auto" />
            )}
          </span>
        )}
      </span>
    </button>
  );
}
