"use client";

// Shared detail vocabulary for the card-detail variants: the pieces that are
// identical DNA across all three directions (facts, thread entries, the
// composer). Each variant composes these differently; none restyles them.

import { ChevronDown } from "lucide-react";

import { cn } from "~/lib/utils";

import { MemberAvatar } from "./bits";
import {
  currentUser,
  type MockCard,
  type MockComment,
  type MockPriority,
  priorityColor,
  priorityLabel,
} from "./mock-data";

export function MicroLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EditableValue({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "group/edit flex w-fit items-center gap-1.5 text-left transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none",
        className,
      )}
    >
      {children}
      <ChevronDown
        className="h-3 w-3 shrink-0 text-muted-foreground transition-colors group-hover/edit:text-primary"
        aria-hidden
      />
    </button>
  );
}

export function PriorityValue({ priority }: { priority: MockPriority }) {
  return (
    <span className="flex items-center gap-2 text-sm">
      <span
        className="h-3.5 w-0.5 shrink-0"
        style={{ backgroundColor: priorityColor[priority] }}
        aria-hidden
      />
      {priorityLabel[priority]}
    </span>
  );
}

export function AssigneeValue({ card }: { card: MockCard }) {
  if (!card.assignee) {
    return <span className="text-sm text-muted-foreground">Unassigned</span>;
  }
  return (
    <span className="flex items-center gap-2 text-sm">
      <MemberAvatar person={card.assignee} />
      {card.assignee.name}
    </span>
  );
}

export function DueValue({ card }: { card: MockCard }) {
  if (!card.dueFull) {
    return <span className="text-sm text-muted-foreground">No due date</span>;
  }
  return (
    <span
      className={cn(
        "font-mono text-xs",
        card.overdue ? "text-destructive" : "text-foreground",
      )}
    >
      {card.dueFull}
      {card.overdue && " (overdue)"}
    </span>
  );
}

export function LabelChips({ card }: { card: MockCard }) {
  if (!card.label) {
    return <span className="text-sm text-muted-foreground">None</span>;
  }
  return (
    <span className="flex flex-wrap gap-1.5">
      <span className="border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
        {card.label}
      </span>
    </span>
  );
}

export function DescriptionBody({ card }: { card: MockCard }) {
  if (!card.body?.length) {
    return (
      <div className="border border-dashed border-border px-4 py-6">
        <p className="text-sm text-muted-foreground">
          No description yet. Click to add one.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {card.body.map((paragraph, index) => (
        <p
          key={index}
          className="max-w-[65ch] text-sm leading-relaxed text-foreground/90"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export function CommentEntry({ comment }: { comment: MockComment }) {
  return (
    <div className="flex gap-3 py-4">
      <MemberAvatar person={comment.author} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[13px] font-medium">{comment.author.name}</span>
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
            {comment.when}
          </span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {comment.body}
        </p>
      </div>
    </div>
  );
}

export function CommentThread({ card }: { card: MockCard }) {
  if (!card.thread?.length) {
    return <p className="py-4 text-sm text-muted-foreground">No comments yet.</p>;
  }
  return (
    <div className="divide-y divide-border/60">
      {card.thread.map((comment, index) => (
        <CommentEntry key={index} comment={comment} />
      ))}
    </div>
  );
}

export function CommentComposer() {
  return (
    <div className="flex gap-3 pt-4">
      <MemberAvatar person={currentUser} />
      <div className="min-w-0 flex-1">
        <textarea
          rows={2}
          placeholder="Add a comment"
          className="w-full resize-none border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-foreground/60 focus-visible:outline-none"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            className="border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:border-primary focus-visible:text-primary focus-visible:outline-none"
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  );
}
