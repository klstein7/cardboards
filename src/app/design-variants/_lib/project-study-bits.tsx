import { ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";

import { BrandIcon } from "~/components/brand/brand-icon";
import { cn } from "~/lib/utils";

import { MemberAvatar } from "./bits";
import { type MockPerson } from "./mock-data";
import {
  type ProjectBoardStudy,
  type ProjectHealth,
} from "./project-study-data";

export function ProjectStudyHeader({
  study,
  children,
}: {
  study: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex h-12 shrink-0 items-stretch border-b border-border bg-background">
      <Link
        href="/design-variants"
        aria-label="Back to design variants"
        className="flex w-12 shrink-0 items-center justify-center border-r border-border transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <BrandIcon variant="xsmall" />
      </Link>

      <div className="flex min-w-0 items-center gap-2 px-3.5 text-sm sm:px-4">
        <span className="hidden text-muted-foreground sm:inline">Projects</span>
        <span className="hidden text-border sm:inline">/</span>
        <span className="truncate font-medium">{study}</span>
      </div>

      <div className="min-w-0 flex-1" />
      {children}
      <Link
        href="/projects"
        className="flex shrink-0 items-center gap-1.5 border-l border-primary bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary-foreground active:translate-y-px sm:px-4"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">New project</span>
      </Link>
    </header>
  );
}

export function ProjectMemberStack({
  members,
  max = 4,
  className,
}: {
  members: MockPerson[];
  max?: number;
  className?: string;
}) {
  const visibleMembers = members.slice(0, max);
  const extraMembers = members.length - visibleMembers.length;

  return (
    <span
      className={cn("flex items-center", className)}
      aria-label={`${members.length} project members`}
    >
      <span className="flex -space-x-1.5">
        {visibleMembers.map((person) => (
          <MemberAvatar
            key={person.name}
            person={person}
            className="ring-2 ring-background"
          />
        ))}
      </span>
      {extraMembers > 0 && (
        <span className="ml-2 font-mono text-[9px] text-muted-foreground">
          +{extraMembers}
        </span>
      )}
    </span>
  );
}

export function ProjectHealthLabel({ health }: { health: ProjectHealth }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.1em]",
        health === "Needs attention"
          ? "text-destructive"
          : health === "On track"
            ? "text-primary"
            : "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5",
          health === "Needs attention"
            ? "bg-destructive"
            : health === "On track"
              ? "bg-primary"
              : "bg-muted-foreground",
        )}
        aria-hidden
      />
      {health}
    </span>
  );
}

export function ProgressLine({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      className={cn("block h-px overflow-hidden bg-border", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label={`${value}% complete`}
    >
      <span
        className="block h-full bg-primary transition-[width] duration-200 motion-reduce:transition-none"
        style={{ width: `${value}%` }}
      />
    </span>
  );
}

export function BoardStudyRow({
  board,
  selected,
  onSelect,
  className,
}: {
  board: ProjectBoardStudy;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
}) {
  const content = (
    <>
      <span
        className="h-3 w-0.5 shrink-0"
        style={{ backgroundColor: board.color }}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate text-sm transition-colors group-hover:text-primary">
        {board.name}
      </span>
      <span className="hidden font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground sm:inline">
        {board.state}
      </span>
      <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
        {board.completed}/{board.cards}
      </span>
      {onSelect && (
        <ArrowUpRight
          className="h-3.5 w-3.5 text-muted-foreground transition-[color,transform] group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-primary motion-reduce:transition-none"
          aria-hidden
        />
      )}
    </>
  );

  if (!onSelect) {
    return (
      <div className={cn("group flex items-center gap-3 py-3", className)}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group flex min-h-11 w-full items-center gap-3 px-3 text-left transition-colors hover:bg-accent/45 focus-visible:bg-accent/45 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring",
        selected && "bg-accent/55",
        className,
      )}
    >
      {content}
    </button>
  );
}
