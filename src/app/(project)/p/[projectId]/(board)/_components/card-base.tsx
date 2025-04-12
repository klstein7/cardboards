"use client";

import { format, formatDistanceToNow } from "date-fns";
import { CalendarIcon, CheckIcon } from "lucide-react";
import { memo } from "react";

import { type Card } from "~/app/(project)/_types";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn, getColor, getPriorityByValue } from "~/lib/utils";

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

    const priority = getPriorityByValue(card.priority);
    const priorityColor = priority ? getColor(card.priority) : undefined;

    const getStatusIndicator = () => {
      if (isCompleted) {
        return (
          <div className="bg-success text-success-foreground absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full shadow-sm">
            <CheckIcon className="h-3 w-3" />
          </div>
        );
      }
      return null;
    };

    return (
      <div
        className={cn(
          "group relative flex flex-col gap-2 rounded-md border bg-card p-3 transition-all duration-200",
          activeCard?.id === card.id && !isDragging && "opacity-50",
          isCompleted && "opacity-60",
          priority && "border-l-[3px]",
          isDragging && "shadow-md",
          isDragging && "pointer-events-none select-none",
          "hover:translate-y-[-1px] hover:bg-card/95 hover:shadow-sm",
          className,
        )}
        style={{
          borderLeftColor: priorityColor,
          ...style,
        }}
        onClick={onClick}
      >
        {getStatusIndicator()}
        {children}

        {/* Header area with metadata */}
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-medium">Created</span>
            <span>
              {formatDistanceToNow(card.createdAt, { addSuffix: true })}
            </span>
          </div>
          {card.dueDate && (
            <div className="flex items-center gap-1 rounded-full bg-secondary/40 px-2 py-0.5 text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              <span className="font-medium">
                {format(card.dueDate, "MMM d")}
              </span>
            </div>
          )}
        </div>

        {/* Title and description */}
        <div className="flex flex-col space-y-1">
          <h3
            className={cn(
              "line-clamp-2 text-base font-medium tracking-tight",
              isCompleted && "text-muted-foreground line-through",
            )}
          >
            {card.title}
          </h3>
          {card.description && (
            <div
              className={cn(
                "prose prose-sm prose-invert line-clamp-2 text-xs text-muted-foreground",
                isCompleted && "line-through",
              )}
              dangerouslySetInnerHTML={{ __html: card.description ?? "" }}
            />
          )}
        </div>

        {/* Footer area with labels, priority, and assignee */}
        <div className="mt-auto flex flex-col gap-2">
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.labels.map((label, index) => (
                <div
                  key={index}
                  className="rounded-full bg-secondary/40 px-2 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end justify-between">
            {priority && (
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5",
                  "bg-opacity-10 transition-colors",
                )}
                style={{
                  color: priorityColor,
                  backgroundColor: `${priorityColor}10`,
                }}
              >
                <priority.icon className="h-3 w-3" />
                <span className="text-xs font-medium">{priority.label}</span>
              </div>
            )}
            {card.assignedTo && (
              <div className="flex items-center gap-1">
                <Avatar className="h-5 w-5 border border-background ring-1 ring-background/30">
                  <AvatarImage src={card.assignedTo.user.imageUrl ?? ""} />
                  <AvatarFallback className="text-xs">
                    {card.assignedTo.user.name?.[0] ?? ""}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

CardBase.displayName = "CardBase";
