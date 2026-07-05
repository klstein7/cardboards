"use client";

import { format, isPast } from "date-fns";
import { CheckIcon } from "lucide-react";
import { memo } from "react";

import { type Card } from "~/app/(project)/_types";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn, getColor } from "~/lib/utils";

import { useBoardState } from "./board-state-provider";

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

    return (
      <div
        className={cn(
          "group relative flex cursor-grab select-none flex-col gap-2 border border-border border-l-2 bg-transparent p-3 transition-colors",
          "hover:border-muted-foreground/40",
          activeCard?.id === card.id && !isDragging && "opacity-50",
          isCompleted && "opacity-60",
          isDragging && "pointer-events-none select-none",
          className,
        )}
        style={{ borderLeftColor: priorityColor, ...style }}
        onClick={onClick}
      >
        {isCompleted && (
          <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-primary text-primary-foreground">
            <CheckIcon className="h-2.5 w-2.5" />
          </div>
        )}
        {children}

        <h3
          className={cn(
            "line-clamp-3 text-[13px] font-medium leading-snug text-card-foreground",
            isCompleted && "text-muted-foreground line-through",
          )}
        >
          {card.title}
        </h3>

        {card.labels && card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.labels.map((label, index) => (
              <span
                key={index}
                className="bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
          {dueDate && (
            <span className={cn(isOverdue && "text-destructive")}>
              {format(dueDate, "MMM d")}
            </span>
          )}
          <span className="ml-auto flex items-center gap-2.5">
            {card.assignedTo && (
              <Avatar className="h-4 w-4">
                <AvatarImage src={card.assignedTo.user.imageUrl ?? ""} />
                <AvatarFallback className="text-[8px]">
                  {card.assignedTo.user.name?.[0] ?? ""}
                </AvatarFallback>
              </Avatar>
            )}
          </span>
        </div>
      </div>
    );
  },
);

CardBase.displayName = "CardBase";
