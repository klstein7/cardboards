"use client";

import { Search, X } from "lucide-react";
import { type KeyboardEvent, useMemo, useRef, useState } from "react";

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

const initialLaneIndex = 1;

export default function BoardAperturePage() {
  const [activeLaneIndex, setActiveLaneIndex] = useState(initialLaneIndex);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(214);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const mobileTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const isFiltered = normalizedQuery.length > 0;

  const visibleColumns = useMemo(() => {
    if (!normalizedQuery) return boardColumns;

    return boardColumns.map((column) => ({
      ...column,
      cards: column.cards.filter((card) =>
        [card.title, card.label ?? "", card.assignee?.name ?? ""]
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalizedQuery),
      ),
    }));
  }, [normalizedQuery]);

  const visibleCardCount = visibleColumns.reduce(
    (total, column) => total + column.cards.length,
    0,
  );
  const activeMobileColumn = visibleColumns[activeLaneIndex]!;

  const toggleSearch = () => {
    if (searchOpen) setQuery("");
    setSearchOpen((open) => !open);
  };

  const activateMobileTab = (nextIndex: number) => {
    setActiveLaneIndex(nextIndex);
    mobileTabRefs.current[nextIndex]?.focus();
  };

  const handleMobileTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % visibleColumns.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex =
        (currentIndex - 1 + visibleColumns.length) % visibleColumns.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = visibleColumns.length - 1;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    activateMobileTab(nextIndex);
  };

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <BoardStudyHeader>
        <HeaderUtilities onSearch={toggleSearch} />
      </BoardStudyHeader>

      <section className="flex shrink-0 flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-end sm:justify-between md:px-6 md:py-5">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-light tracking-tight">
            {boardName}
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            One lane open. Every other stage stays within reach.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-5">
          <BoardMembers className="md:hidden" />
          <BoardFigures />
        </div>
      </section>

      {searchOpen && (
        <label className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-4 focus-within:border-foreground/60 md:px-6">
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
          <span
            className="hidden font-mono text-[10px] text-muted-foreground sm:inline"
            aria-live="polite"
          >
            {visibleCardCount} found
          </span>
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

      <div
        className="hidden min-h-0 flex-1 overflow-hidden md:flex"
        role="region"
        aria-label="Launch checklist lanes"
      >
        {visibleColumns.map((column, index) => (
          <DesktopApertureLane
            key={column.name}
            column={column}
            isActive={index === activeLaneIndex}
            isFiltered={isFiltered}
            selectedCardId={selectedCardId}
            onActivate={() => setActiveLaneIndex(index)}
            onSelectCard={setSelectedCardId}
          />
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        <div className="shrink-0 overflow-x-auto border-b border-border">
          <div
            className="flex min-w-max"
            role="tablist"
            aria-label="Board lanes"
            aria-orientation="horizontal"
          >
            {visibleColumns.map((column, index) => {
              const isActive = index === activeLaneIndex;

              return (
                <button
                  key={column.name}
                  ref={(node) => {
                    mobileTabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`aperture-tab-${index}`}
                  aria-controls={`aperture-panel-${index}`}
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveLaneIndex(index)}
                  onKeyDown={(event) => handleMobileTabKeyDown(event, index)}
                  className={cn(
                    "flex h-12 min-w-28 items-center justify-center gap-2 border-b-2 px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring",
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                  )}
                >
                  <span>{column.name}</span>
                  <span
                    className={cn(
                      "flex h-4 min-w-4 items-center justify-center px-1 font-mono text-[9px]",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground",
                    )}
                  >
                    {column.cards.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <section
          key={activeMobileColumn.name}
          id={`aperture-panel-${activeLaneIndex}`}
          role="tabpanel"
          aria-labelledby={`aperture-tab-${activeLaneIndex}`}
          tabIndex={0}
          className="min-h-0 flex-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <LaneWorkspace
            column={activeMobileColumn}
            isFiltered={isFiltered}
            selectedCardId={selectedCardId}
            onSelectCard={setSelectedCardId}
            headingId={`aperture-mobile-heading-${activeLaneIndex}`}
          />
        </section>
      </div>

      <BoardStudySwitcher active="aperture" />
    </main>
  );
}

function DesktopApertureLane({
  column,
  isActive,
  isFiltered,
  selectedCardId,
  onActivate,
  onSelectCard,
}: {
  column: MockColumn;
  isActive: boolean;
  isFiltered: boolean;
  selectedCardId: number | null;
  onActivate: () => void;
  onSelectCard: (cardId: number) => void;
}) {
  const headingId = `aperture-desktop-${column.name
    .toLocaleLowerCase()
    .replaceAll(" ", "-")}`;

  return (
    <section
      aria-labelledby={isActive ? headingId : undefined}
      aria-label={isActive ? undefined : `${column.name} lane`}
      className={cn(
        "relative min-h-0 min-w-0 shrink-0 basis-[4.5rem] overflow-hidden border-r border-border transition-[flex-grow] duration-300 ease-out last:border-r-0 motion-reduce:transition-none lg:basis-[5.5rem] xl:basis-28",
        isActive ? "grow" : "grow-0",
      )}
    >
      {isActive ? (
        <div className="h-full min-w-[28rem] duration-200 animate-in fade-in motion-reduce:animate-none lg:min-w-[38rem]">
          <LaneWorkspace
            column={column}
            isFiltered={isFiltered}
            selectedCardId={selectedCardId}
            onSelectCard={onSelectCard}
            headingId={headingId}
          />
        </div>
      ) : (
        <CompactLaneRail column={column} onActivate={onActivate} />
      )}
    </section>
  );
}

function CompactLaneRail({
  column,
  onActivate,
}: {
  column: MockColumn;
  onActivate: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onActivate}
      aria-label={`Open ${column.name} lane, ${column.cards.length} cards`}
      className="group absolute inset-y-0 left-0 flex w-[4.5rem] flex-col items-center bg-background px-2 py-4 text-center transition-colors hover:bg-accent/30 focus-visible:bg-accent/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring lg:w-[5.5rem] xl:w-28 xl:px-3"
    >
      <span className="flex h-5 min-w-5 items-center justify-center bg-primary px-1 font-mono text-[9px] text-primary-foreground">
        {String(column.cards.length).padStart(2, "0")}
      </span>

      <span className="mt-4 line-clamp-2 text-[10px] font-medium uppercase leading-tight tracking-[0.12em] text-muted-foreground transition-colors group-hover:text-foreground xl:text-[11px]">
        {column.name}
      </span>

      <span
        className="mt-7 flex min-h-0 w-full flex-1 flex-col gap-3"
        aria-hidden
      >
        {column.cards.length === 0 ? (
          <span className="mx-auto h-4 w-6 border border-dashed border-border" />
        ) : (
          column.cards.slice(0, 4).map((card) => (
            <span
              key={card.id}
              className="flex w-full min-w-0 items-start gap-1.5 border-t border-border/70 pt-2"
            >
              {column.isCompleted ? (
                <span className="h-3 w-0.5 bg-border" />
              ) : (
                <PriorityTick card={card} className="h-3" />
              )}
              <span className="mt-1 h-px flex-1 bg-border transition-colors group-hover:bg-muted-foreground xl:hidden" />
              <span className="hidden min-w-0 flex-1 text-left text-[9px] leading-snug text-muted-foreground xl:line-clamp-2">
                {card.title}
              </span>
            </span>
          ))
        )}
      </span>
    </button>
  );
}

function LaneWorkspace({
  column,
  isFiltered,
  selectedCardId,
  onSelectCard,
  headingId,
}: {
  column: MockColumn;
  isFiltered: boolean;
  selectedCardId: number | null;
  onSelectCard: (cardId: number) => void;
  headingId: string;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex min-h-24 shrink-0 items-end justify-between gap-5 border-b border-border px-5 py-5 lg:px-7">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h2
              id={headingId}
              className="truncate text-2xl font-light tracking-tight"
            >
              {column.name}
            </h2>
            <span className="flex h-5 min-w-5 items-center justify-center bg-primary px-1 font-mono text-[10px] text-primary-foreground">
              {String(column.cards.length).padStart(2, "0")}
            </span>
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {isFiltered ? "Matching cards" : "Cards in view"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <AddCardButton label="Add card" className="hidden sm:flex" />
          <LaneMenuButton lane={column.name} />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pb-16">
        {column.cards.length > 0 ? (
          <div className="mx-auto w-full max-w-5xl">
            {column.cards.map((card) => (
              <ApertureCard
                key={card.id}
                card={card}
                isCompleted={column.isCompleted ?? false}
                isSelected={card.id === selectedCardId}
                onSelect={() => onSelectCard(card.id)}
              />
            ))}
          </div>
        ) : (
          <LaneEmptyState isFiltered={isFiltered} />
        )}
      </div>
    </div>
  );
}

function ApertureCard({
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
  const description = !isCompleted ? card.body?.[0] : undefined;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={cn(
        "group flex min-h-40 w-full items-stretch gap-4 border-b border-border/70 px-5 py-5 text-left transition-colors hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none lg:px-7 lg:py-6",
        isSelected && "bg-accent/55",
      )}
    >
      {isCompleted ? (
        <span className="w-0.5 shrink-0 bg-border" aria-hidden />
      ) : (
        <PriorityTick card={card} className="h-5" />
      )}

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          <span>CB-{card.id}</span>
          <span aria-hidden>·</span>
          <span>
            {isCompleted ? "Completed" : priorityLabel[card.priority]}
          </span>
        </span>

        <span
          className={cn(
            "mt-3 text-base font-medium leading-snug transition-colors lg:text-lg",
            isCompleted
              ? "text-muted-foreground line-through"
              : "group-hover:text-primary",
            isSelected && !isCompleted && "text-primary",
          )}
        >
          {card.title}
        </span>

        {description && (
          <span className="mt-2 line-clamp-2 max-w-[65ch] text-xs leading-relaxed text-muted-foreground lg:text-sm">
            {description}
          </span>
        )}

        <CardMetadata card={card} className="mt-auto pt-5" />
      </span>
    </button>
  );
}

function LaneEmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <div className="p-5 lg:p-7">
      <div className="flex min-h-56 flex-col items-start justify-end border border-dashed border-border p-6">
        <span className="h-6 w-6 border border-dashed border-muted-foreground" />
        <h3 className="mt-5 text-xl font-light tracking-tight">
          {isFiltered ? "No matches here" : "This lane is clear"}
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {isFiltered
            ? "Try another search, or open a neighboring lane to inspect its results."
            : "Nothing is waiting in this stage. Add a card when work needs to stop here."}
        </p>
        {!isFiltered && (
          <AddCardButton label="Add the first card" className="mt-5" />
        )}
      </div>
    </div>
  );
}
