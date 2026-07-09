"use client";

import { CircleDashed, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "~/lib/utils";

import {
  AddCardButton,
  BoardFigures,
  BoardMembers,
  BoardStudyHeader,
  CardMetadata,
  HeaderUtilities,
  LaneMenuButton,
  PriorityTick,
} from "../_lib/board-study-bits";
import { BoardStudySwitcher } from "../_lib/board-study-switcher";
import {
  boardColumns,
  boardName,
  defaultCard,
  type MockCard,
  type MockColumn,
  priorityLabel,
} from "../_lib/mock-data";

export default function BoardRunwayPage() {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(
    defaultCard.id,
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visibleColumns = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return boardColumns;

    return boardColumns.map((column) => ({
      ...column,
      cards: column.cards.filter((card) =>
        [card.title, card.label, card.assignee?.name]
          .filter(Boolean)
          .some((value) =>
            value!.toLocaleLowerCase().includes(normalizedQuery),
          ),
      ),
    }));
  }, [query]);

  const toggleSearch = () => {
    if (searchOpen) setQuery("");
    setSearchOpen(!searchOpen);
  };

  const closeSearch = () => {
    setQuery("");
    setSearchOpen(false);
  };

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <BoardStudyHeader>
        <HeaderUtilities onSearch={toggleSearch} />
      </BoardStudyHeader>

      <section className="shrink-0 border-b border-border px-4 py-5 sm:px-5 md:px-7 md:py-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-light tracking-[-0.025em] md:text-[2.5rem] md:leading-none">
              {boardName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Every stage, one uninterrupted line of work.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:justify-end">
            <BoardMembers className="md:hidden" />
            <BoardFigures />
          </div>
        </div>

        {searchOpen && (
          <label className="mt-5 flex max-w-xl items-center gap-2 border-b border-foreground/60 pb-1.5">
            <span className="sr-only">Search tasks</span>
            <Search
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") closeSearch();
              }}
              placeholder="Search title, label, or teammate"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
              className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </label>
        )}
      </section>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-14"
        aria-label="Launch checklist stages"
      >
        <div className="divide-y divide-border border-b border-border">
          {visibleColumns.map((column) => (
            <RunwayLane
              key={column.name}
              column={column}
              selectedCardId={selectedCardId}
              onSelectCard={setSelectedCardId}
              isFiltered={query.trim().length > 0}
              onClearSearch={closeSearch}
            />
          ))}
        </div>
      </div>

      <BoardStudySwitcher active="runway" />
    </main>
  );
}

function RunwayLane({
  column,
  selectedCardId,
  onSelectCard,
  isFiltered,
  onClearSearch,
}: {
  column: MockColumn;
  selectedCardId: number | null;
  onSelectCard: (cardId: number) => void;
  isFiltered: boolean;
  onClearSearch: () => void;
}) {
  const headingId = `runway-stage-${column.name
    .toLocaleLowerCase()
    .replaceAll(" ", "-")}`;

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-h-[11rem] flex-col"
    >
      <header className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3 sm:px-4">
        <h2
          id={headingId}
          className="min-w-0 truncate text-sm font-medium tracking-tight"
        >
          {column.name}
        </h2>
        <span className="flex h-4 min-w-4 shrink-0 items-center justify-center bg-primary px-1 font-mono text-[9px] text-primary-foreground">
          {String(column.cards.length).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1" />
        {column.cards.length > 0 && (
          <AddCardButton label="Add task" className="hidden sm:flex" />
        )}
        <LaneMenuButton lane={column.name} />
      </header>

      {column.cards.length > 0 ? (
        <div
          role="region"
          aria-label={`${column.name} tasks`}
          tabIndex={0}
          className="min-w-0 overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <div className="grid h-full min-h-[8.5rem] w-max auto-cols-[16.5rem] grid-flow-col divide-x divide-border/80 md:auto-cols-[19rem]">
            {column.cards.map((card) => (
              <RunwayTask
                key={card.id}
                card={card}
                isCompleted={column.isCompleted ?? false}
                isSelected={card.id === selectedCardId}
                onSelect={() => onSelectCard(card.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <RunwayEmpty isFiltered={isFiltered} onClearSearch={onClearSearch} />
      )}
    </section>
  );
}

function RunwayTask({
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
  const description = card.body?.[0];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={cn(
        "group flex h-full min-h-[8.5rem] w-full flex-col px-4 py-3.5 text-left transition-colors duration-150 hover:bg-accent/45 focus-visible:bg-accent/45 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary active:bg-accent/65 md:px-5",
        isSelected && "bg-accent/55",
      )}
    >
      <span className="flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.11em] text-muted-foreground">
        <span>#{card.id}</span>
        <span>{isCompleted ? "Complete" : priorityLabel[card.priority]}</span>
      </span>

      <span className="mt-3 flex min-w-0 flex-1 items-start gap-3">
        {isCompleted ? (
          <span className="mt-0.5 h-4 w-0.5 shrink-0 bg-border" aria-hidden />
        ) : (
          <PriorityTick card={card} className="mt-0.5 h-4" />
        )}
        <span className="min-w-0">
          <span
            className={cn(
              "line-clamp-3 block text-[13px] font-medium leading-snug transition-colors duration-150",
              isCompleted
                ? "text-muted-foreground line-through"
                : "group-hover:text-primary group-focus-visible:text-primary",
              isSelected && !isCompleted && "text-primary",
            )}
          >
            {card.title}
          </span>
          {description && !isCompleted && (
            <span className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
              {description}
            </span>
          )}
        </span>
      </span>

      <CardMetadata card={card} className="mt-2 pl-3.5" />
    </button>
  );
}

function RunwayEmpty({
  isFiltered,
  onClearSearch,
}: {
  isFiltered: boolean;
  onClearSearch: () => void;
}) {
  return (
    <div className="min-w-0 p-3 sm:p-4">
      <div className="flex min-h-[7.5rem] flex-col items-start justify-center gap-3 border border-dashed border-border px-4 py-4 sm:min-h-[8.5rem] sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <CircleDashed
            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-sm font-light tracking-tight">
              {isFiltered ? "No matching work" : "This stage is clear"}
            </p>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
              {isFiltered
                ? "Try another title, label, or teammate."
                : "Move work here when it needs an unblock."}
            </p>
          </div>
        </div>

        {isFiltered ? (
          <button
            type="button"
            onClick={onClearSearch}
            className="min-h-7 shrink-0 px-1 text-xs text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground focus-visible:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Clear search
          </button>
        ) : (
          <AddCardButton label="Add task" className="shrink-0" />
        )}
      </div>
    </div>
  );
}
