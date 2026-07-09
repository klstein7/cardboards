import {
  Bell,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

import { BrandIcon } from "~/components/brand/brand-icon";
import { cn } from "~/lib/utils";

import { MemberAvatar } from "./bits";
import {
  aisha,
  boardName,
  dana,
  doneCards,
  maren,
  type MockCard,
  priorityColor,
  projectName,
  tomas,
  totalCards,
  yuki,
} from "./mock-data";

const members = [maren, tomas, aisha, dana, yuki];

export function BoardStudyHeader({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-stretch border-b border-border bg-background",
        className,
      )}
    >
      <Link
        href="/design-variants"
        aria-label="Back to design variants"
        className="flex w-12 shrink-0 items-center justify-center border-r border-border transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <BrandIcon variant="xsmall" />
      </Link>

      <div className="flex min-w-0 items-center gap-2 px-3.5 text-sm sm:px-4">
        <span className="hidden truncate text-muted-foreground sm:inline">
          {projectName}
        </span>
        <span className="hidden text-border sm:inline">/</span>
        <span className="truncate font-medium">{boardName}</span>
      </div>

      <div className="min-w-0 flex-1" />
      {children}
    </header>
  );
}

export function BoardMembers({ className }: { className?: string }) {
  return (
    <div className={cn("flex -space-x-1.5", className)} aria-label="5 members">
      {members.map((person) => (
        <MemberAvatar
          key={person.name}
          person={person}
          className="ring-2 ring-background"
        />
      ))}
    </div>
  );
}

export function BoardFigures({ className }: { className?: string }) {
  const percent = Math.round((doneCards / totalCards) * 100);

  return (
    <div
      className={cn(
        "flex items-center gap-4 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground",
        className,
      )}
    >
      <span>{totalCards} cards</span>
      <span>{doneCards} done</span>
      <span className="text-primary">{percent}%</span>
    </div>
  );
}

export function UtilityButton({
  label,
  children,
  className,
  ...props
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "flex w-11 shrink-0 items-center justify-center border-l border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring active:translate-y-px",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function HeaderUtilities({ onSearch }: { onSearch?: () => void }) {
  return (
    <>
      <div className="hidden items-center border-l border-border px-3 md:flex">
        <BoardMembers />
      </div>
      <UtilityButton label="Search board" onClick={onSearch}>
        <Search className="h-4 w-4" aria-hidden />
      </UtilityButton>
      <UtilityButton label="Filter board">
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
      </UtilityButton>
      <UtilityButton label="Notifications, unread items" className="relative">
        <Bell className="h-4 w-4" aria-hidden />
        <span
          className="absolute right-2 top-2 h-1.5 w-1.5 bg-primary"
          aria-hidden
        />
      </UtilityButton>
      <button
        type="button"
        aria-label="New card"
        className="flex shrink-0 items-center gap-1.5 border-l border-primary bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary-foreground active:translate-y-px sm:px-4"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">New card</span>
      </button>
    </>
  );
}

export function PriorityTick({
  card,
  className,
}: {
  card: MockCard;
  className?: string;
}) {
  return (
    <span
      className={cn("w-0.5 shrink-0", className)}
      style={{ backgroundColor: priorityColor[card.priority] }}
      aria-hidden
    />
  );
}

export function CardMetadata({
  card,
  className,
  hideAvatar = false,
}: {
  card: MockCard;
  className?: string;
  hideAvatar?: boolean;
}) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2", className)}>
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
        <span className="min-w-0 max-w-28 truncate border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-muted-foreground">
          {card.label}
        </span>
      )}
      {card.assignee && !hideAvatar && (
        <MemberAvatar person={card.assignee} className="ml-auto" />
      )}
    </span>
  );
}

export function LaneMenuButton({ lane }: { lane: string }) {
  return (
    <button
      type="button"
      aria-label={`More actions for ${lane}`}
      className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <MoreHorizontal className="h-4 w-4" aria-hidden />
    </button>
  );
}

export function AddCardButton({
  label = "Add card",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex min-h-7 items-center gap-1.5 px-1 text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:translate-y-px",
        className,
      )}
    >
      <Plus className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}
