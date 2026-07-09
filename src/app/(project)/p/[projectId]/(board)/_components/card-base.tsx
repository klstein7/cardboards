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
}

export const CardBase = memo(
  ({
    card,
    className,
    isDragging,
    isCompleted,
    onClick,
    style,
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
          "group/card relative flex cursor-grab select-none items-stretch gap-3 px-3.5 py-3 transition-colors hover:bg-accent/50",
          activeCard?.id === card.id && !isDragging && "opacity-50",
          isDragging && "pointer-events-none select-none",
          className,
        )}
        style={style}
        onClick={onClick}
      >
        <span
          className="w-0.5 shrink-0"
          style={{
            backgroundColor: isCompleted ? "hsl(var(--border))" : priorityColor,
          }}
          aria-hidden
        />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h3
            className={cn(
              "truncate text-sm text-card-foreground transition-colors group-hover/card:text-primary",
              isCompleted &&
                "text-muted-foreground line-through group-hover/card:text-muted-foreground",
            )}
          >
            {card.title}
          </h3>

          <div className="flex items-center gap-2">
            {dueDate && (
              <span
                className={cn(
                  "shrink-0 font-mono text-[10px]",
                  isOverdue ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {format(dueDate, "MMM d")}
              </span>
            )}

            {visibleLabels.map((label, index) => (
              <span
                key={index}
                className="shrink-0 border border-border px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground"
              >
                {label}
              </span>
            ))}
            {extraLabels > 0 && (
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                +{extraLabels}
              </span>
            )}

            {card.assignedTo ? (
              <Avatar className="ml-auto h-5 w-5 shrink-0">
                <AvatarImage src={card.assignedTo.user.imageUrl ?? ""} />
                <AvatarFallback className="text-[9px]">
                  {card.assignedTo.user.name?.[0] ?? ""}
                </AvatarFallback>
              </Avatar>
            ) : (
              <span className="ml-auto h-5 w-5 shrink-0" aria-hidden />
            )}
          </div>
        </div>
      </div>
    );
  },
);

CardBase.displayName = "CardBase";
