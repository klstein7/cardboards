// Shared pieces for the /design-variants board mockups: the adopted Lanes
// entry treatment, a lane column, and the board bar, so every variant keeps
// the same DNA and differs only in how it spends the page's width.

import { CheckCircle2, Ellipsis, MessageSquare, Plus } from "lucide-react";

import { cn } from "~/lib/utils";

import {
  avatarStyle,
  boardName,
  doneCards,
  members,
  type MockCard,
  type MockColumn,
  priorityColor,
  totalCards,
} from "./mock-data";

export const laneAccent: Record<string, string> = {
  Backlog: "hsl(var(--border))",
  "In progress": "hsl(var(--primary))",
  Blocked: "hsl(var(--destructive))",
  "In review": "var(--priority-high-color)",
  Done: "var(--priority-low-color)",
};

export const labelFilters = ["Bug", "Feature", "Design", "Performance"];

export function EntryCard({
  card,
  isCompleted,
  isSelected,
}: {
  card: MockCard;
  isCompleted?: boolean;
  isSelected?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative -mx-5 cursor-pointer px-5 py-3 transition-colors hover:bg-primary/[0.04]",
        isSelected && "bg-primary/[0.06]",
      )}
    >
      <div className="relative pl-3">
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
            isSelected && "text-primary",
          )}
        >
          {card.title}
        </h3>
        <div className="mt-2 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <span className="border border-border px-1.5 py-0.5 text-[10px]">
            {card.label}
          </span>
          {card.due && (
            <span className={cn("px-0.5", card.overdue && "text-destructive")}>
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
    </div>
  );
}

export function Lane({
  column,
  selectedTitle,
}: {
  column: MockColumn;
  selectedTitle?: string;
}) {
  return (
    <div
      className="flex min-h-0 min-w-0 flex-col border-t-2"
      style={{ borderTopColor: laneAccent[column.name] }}
    >
      <div className="group/head flex items-center gap-2 px-5 pb-3 pt-4">
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
        <button
          className="ml-auto text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover/head:opacity-100 max-sm:opacity-100"
          aria-label={`Options for ${column.name}`}
        >
          <Ellipsis className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {column.cards.length > 0 ? (
          column.cards.map((card) => (
            <EntryCard
              key={card.title}
              card={card}
              isCompleted={column.isCompleted}
              isSelected={card.title === selectedTitle}
            />
          ))
        ) : (
          <div className="mt-1 flex flex-col items-center gap-1.5 border border-dashed border-border px-4 py-8 text-center">
            <p className="text-sm font-light tracking-tight">No blockers</p>
            <p className="max-w-[22ch] text-[11px] leading-relaxed text-muted-foreground">
              Drag a card here the moment it stalls.
            </p>
          </div>
        )}
      </div>

      {!column.isCompleted ? (
        <button className="flex items-center gap-1.5 px-5 pb-4 pt-2 text-sm text-muted-foreground transition-colors hover:text-primary">
          <Plus className="h-3.5 w-3.5" />
          Add card
        </button>
      ) : (
        <div className="flex items-center gap-1.5 px-5 pb-4 pt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </div>
      )}
    </div>
  );
}

export function BoardBar() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-b border-border px-6 py-4">
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-light tracking-tight">{boardName}</h1>
        <span className="font-mono text-xs text-muted-foreground">
          {totalCards} cards · {doneCards} done
        </span>
      </div>

      <div className="hidden items-center gap-1.5 md:flex">
        {labelFilters.map((label) => (
          <button
            key={label}
            className="border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-4">
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
  );
}
