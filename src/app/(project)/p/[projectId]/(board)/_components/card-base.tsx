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
          <div className="bg-success text-success-foreground absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full shadow-sm">
            <CheckIcon className="h-3.5 w-3.5" />
          </div>
        );
      }
      return null;
    };

    return (
      <div
        className={cn(
          "group relative flex flex-col gap-3 rounded-lg border bg-card/50 p-4 shadow backdrop-blur-[2px] transition-all duration-200",
          activeCard?.id === card.id && !isDragging && "opacity-30",
          isCompleted && "opacity-40 grayscale filter",
          priority && "border-l-4",
          isDragging && "rotate-[0.2deg] shadow-md",
          isDragging && "pointer-events-none select-none",
          "hover:translate-y-[-2px] hover:bg-card/80 hover:shadow-lg",
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
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-medium">Created</span>
            <span>
              {formatDistanceToNow(card.createdAt, { addSuffix: true })}
            </span>
          </div>
          {card.dueDate && (
            <div className="flex items-center gap-1.5 rounded-full bg-secondary/50 px-2.5 py-1 shadow-sm">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span className="font-medium">
                {format(card.dueDate, "MMM d")}
              </span>
            </div>
          )}
        </div>

        {/* Title and description */}
        <div className="flex flex-col space-y-2">
          <h3
            className={cn(
              "line-clamp-2 text-lg font-semibold tracking-tight",
              isCompleted && "text-muted-foreground line-through",
            )}
          >
            {card.title}
          </h3>
          {card.description && (
            <div
              className={cn(
                "prose prose-sm prose-invert line-clamp-2 text-xs text-muted-foreground",
                isCompleted && "line-clamp-1 line-through",
              )}
              dangerouslySetInnerHTML={{ __html: card.description ?? "" }}
            />
          )}
        </div>

        {/* Footer area with labels, priority, and assignee */}
        <div className="mt-auto flex flex-col gap-2.5">
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {card.labels.map((label, index) => (
                <div
                  key={index}
                  className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground shadow-sm"
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
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1",
                  "bg-opacity-20 shadow-sm transition-colors",
                )}
                style={{
                  color: priorityColor,
                  backgroundColor: `${priorityColor}15`, // Using opacity in hex
                }}
              >
                <priority.icon className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{priority.label}</span>
              </div>
            )}
            {card.assignedTo && (
              <div className="flex items-center gap-1">
                <Avatar className="h-7 w-7 border-2 border-background shadow-sm ring-1 ring-background transition-transform">
                  <AvatarImage src={card.assignedTo.user.imageUrl ?? ""} />
                  <AvatarFallback className="text-xs font-medium">
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
