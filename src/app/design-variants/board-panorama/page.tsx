"use client";

import { Search, X } from "lucide-react";
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
  type MockCard,
  type MockColumn,
  priorityLabel,
} from "../_lib/mock-data";

export default function BoardPanoramaPage() {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(214);
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
    setSearchOpen((open) => !open);
    if (searchOpen) setQuery("");
  };

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <BoardStudyHeader>
        <HeaderUtilities onSearch={toggleSearch} />
      </BoardStudyHeader>

      <section className="shrink-0 border-b border-border px-4 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-light tracking-[-0.025em] md:text-[2.5rem] md:leading-none">
              {boardName}
            </h1>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              Launch work from first pass to shipped.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:justify-end">
            <BoardMembers className="md:hidden" />
            <BoardFigures />
            <StageLine />
          </div>
        </div>

        {searchOpen && (
          <label className="mt-5 flex max-w-xl items-center gap-2 border-b border-foreground/60 pb-1.5">
            <span className="sr-only">Search cards</span>
            <Search
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, label, or assignee"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </label>
        )}
      </section>

      <div
        className="min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain md:snap-none"
        role="region"
        aria-label="Launch checklist board"
        tabIndex={0}
      >
        <div className="grid h-full grid-cols-[repeat(5,minmax(82vw,1fr))] divide-x divide-border md:min-w-[1180px] md:grid-cols-[1.16fr_1.08fr_.72fr_.92fr_.86fr] xl:min-w-full">
          {visibleColumns.map((column) => (
            <PanoramaLane
              key={column.name}
              column={column}
              selectedCardId={selectedCardId}
              onSelectCard={setSelectedCardId}
              isFiltered={query.trim().length > 0}
            />
          ))}
        </div>
      </div>

      <BoardStudySwitcher active="panorama" />
    </main>
  );
}

function StageLine() {
  return (
    <div
      className="grid w-28 grid-cols-5 gap-1"
      aria-label="One of five stages complete"
      role="img"
    >
      {[0, 1, 2, 3, 4].map((stage) => (
        <span
          key={stage}
          className={cn("h-px", stage === 4 ? "bg-primary" : "bg-border")}
        />
      ))}
    </div>
  );
}

function PanoramaLane({
  column,
  selectedCardId,
  onSelectCard,
  isFiltered,
}: {
  column: MockColumn;
  selectedCardId: number | null;
  onSelectCard: (cardId: number) => void;
  isFiltered: boolean;
}) {
  return (
    <section className="flex min-h-0 min-w-0 snap-start flex-col">
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3.5">
        <h2 className="min-w-0 truncate text-[11px] font-medium uppercase tracking-[0.13em] text-muted-foreground">
          {column.name}
        </h2>
        <span className="flex h-4 min-w-4 items-center justify-center bg-primary px-1 font-mono text-[9px] text-primary-foreground">
          {String(column.cards.length).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1" />
        <LaneMenuButton lane={column.name} />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pb-16">
        {column.cards.length > 0 ? (
          <div className="divide-y divide-border/70">
            {column.cards.map((card) => (
              <PanoramaCard
                key={card.id}
                card={card}
                isCompleted={column.isCompleted ?? false}
                isSelected={card.id === selectedCardId}
                onSelect={() => onSelectCard(card.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-3.5">
            <div className="border border-dashed border-border px-3 py-7 text-center">
              <p className="text-xs text-muted-foreground">
                {isFiltered ? "No matching cards" : "No cards here"}
              </p>
              {!isFiltered && (
                <AddCardButton
                  label="Add the first card"
                  className="mx-auto mt-3"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PanoramaCard({
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
        "group flex w-full items-stretch gap-3 px-3.5 py-3.5 text-left transition-colors hover:bg-accent/45 focus-visible:bg-accent/45 focus-visible:outline-none",
        isSelected && "bg-accent/55",
      )}
    >
      {isCompleted ? (
        <span className="w-0.5 shrink-0 bg-border" aria-hidden />
      ) : (
        <PriorityTick card={card} />
      )}

      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span
          className={cn(
            "line-clamp-2 text-[13px] font-medium leading-snug transition-colors",
            isCompleted
              ? "text-muted-foreground line-through"
              : "group-hover:text-primary",
            isSelected && !isCompleted && "text-primary",
          )}
        >
          {card.title}
        </span>

        {description && !isCompleted && (
          <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {description}
          </span>
        )}

        <span className="mt-0.5 flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
            {isCompleted ? "Completed" : priorityLabel[card.priority]}
          </span>
          <CardMetadata card={card} className="min-w-0 flex-1" />
        </span>
      </span>
    </button>
  );
}
