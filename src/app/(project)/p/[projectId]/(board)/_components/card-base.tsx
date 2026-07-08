"use client";

import { format, isPast } from "date-fns";
import { memo } from "react";

import { type Card } from "~/app/(project)/_types";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn, getColor } from "~/lib/utils";

import { useBoardState } from "./board-state-provider";

const MAX_VISIBLE_LABELS = 2;

interface CardBaseProps {
  card: Card;
  className?: string;
  isDragging?: boolean;
  isCompleted?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const CardBase = memo(
  ({
    card,
    className,
    isDragging,
    isCompleted,
    onClick,
    style,
    children,
  }: CardBaseProps) => {
    const { activeCard } = useBoardState();

    const priorityColor = getColor(card.priority);
    const dueDate = card.dueDate ? new Date(card.dueDate) : null;
    const isOverdue = dueDate ? isPast(dueDate) && !isCompleted : false;

    const labels = card.labels ?? [];
    const visibleLabels = labels.slice(0, MAX_VISIBLE_LABELS);
    const extraLabels = labels.length - visibleLabels.length;

    return (
      <div
        className={cn(
          "group/card relative flex cursor-grab select-none items-center gap-2.5 px-3 py-2 transition-colors hover:bg-accent/50",
          activeCard?.id === card.id && !isDragging && "opacity-50",
          isDragging && "pointer-events-none select-none",
          className,
        )}
        style={style}
        onClick={onClick}
      >
        <span
          className="h-3 w-0.5 shrink-0"
          style={{
            backgroundColor: isCompleted ? "hsl(var(--border))" : priorityColor,
          }}
          aria-hidden
        />
        {children}

        <h3
          className={cn(
            "min-w-0 flex-1 truncate text-[12.5px] text-card-foreground transition-colors group-hover/card:text-primary",
            isCompleted &&
              "text-muted-foreground line-through group-hover/card:text-muted-foreground",
          )}
        >
          {card.title}
        </h3>

        {dueDate && (
          <span
            className={cn(
              "shrink-0 font-mono text-[9px]",
              isOverdue ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {format(dueDate, "MMM d")}
          </span>
        )}

        {visibleLabels.map((label, index) => (
          <span
            key={index}
            className="shrink-0 border border-border px-1.5 py-0.5 font-mono text-[9px] leading-none text-muted-foreground"
          >
            {label}
          </span>
        ))}
        {extraLabels > 0 && (
          <span className="shrink-0 font-mono text-[9px] text-muted-foreground">
            +{extraLabels}
          </span>
        )}

        {card.assignedTo ? (
          <Avatar className="h-4 w-4 shrink-0">
            <AvatarImage src={card.assignedTo.user.imageUrl ?? ""} />
            <AvatarFallback className="text-[8px]">
              {card.assignedTo.user.name?.[0] ?? ""}
            </AvatarFallback>
          </Avatar>
        ) : (
          <span className="h-4 w-4 shrink-0" aria-hidden />
        )}
      </div>
    );
  },
);

CardBase.displayName = "CardBase";
