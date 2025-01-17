"use client";

import { format, formatDistanceToNow } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { memo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn, getColor, getPriorityByValue } from "~/lib/utils";

import { type Card } from "../../../../_types";
import { useBoardState } from "./board-state-provider";

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

    const priority = getPriorityByValue(card.priority);

    return (
      <div
        className={cn(
          "relative flex flex-col gap-3 border bg-secondary/20 p-4",
          activeCard?.id === card.id && !isDragging && "opacity-30",
          isCompleted && "opacity-25",
          priority && "border-l-4",
          className,
        )}
        style={{
          borderLeftColor: priority ? getColor(card.priority) : undefined,
          ...style,
        }}
        onClick={onClick}
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>{formatDistanceToNow(card.createdAt, { addSuffix: true })}</div>
          {card.dueDate && (
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>{format(card.dueDate, "MMM d")}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className={cn(isCompleted && "line-through")}>
            {card.title}
          </span>
          <div
            className={cn(
              "prose prose-sm prose-invert line-clamp-2 text-muted-foreground",
              isCompleted && "line-clamp-1 line-through",
            )}
            dangerouslySetInnerHTML={{ __html: card.description ?? "" }}
          />
        </div>
        <div className="flex flex-col gap-2">
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {card.labels.map((label, index) => (
                <div
                  key={index}
                  className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {label}
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end justify-between">
            {priority && (
              <div
                className={cn("flex items-center gap-1")}
                style={{ color: getColor(priority.value) }}
              >
                <priority.icon className="h-4 w-4" />
                <span className="text-xs">{priority.label}</span>
              </div>
            )}
            {card.assignedTo && (
              <Avatar className="h-7 w-7">
                <AvatarImage src={card.assignedTo.user.imageUrl ?? ""} />
                <AvatarFallback>
                  {card.assignedTo.user.name?.[0] ?? ""}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </div>
    );
  },
);

CardBase.displayName = "CardBase";
