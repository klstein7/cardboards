"use client";

import { format, isPast } from "date-fns";
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
  asRow?: boolean;
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
    asRow,
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
          "group/card relative flex cursor-grab select-none flex-col transition-colors",
          asRow && "-mx-6 px-6 py-3 hover:bg-primary/[0.04]",
          activeCard?.id === card.id && !isDragging && "opacity-50",
          isDragging && "pointer-events-none select-none",
          className,
        )}
        style={style}
        onClick={onClick}
      >
        <div className="relative pl-4">
          <span
            className="absolute left-0 top-[3px] h-3.5 w-0.5"
            style={{
              backgroundColor: isCompleted
                ? "hsl(var(--border))"
                : priorityColor,
            }}
            aria-hidden
          />
          {children}

          <h3
            className={cn(
              "line-clamp-3 text-[13px] font-medium leading-snug text-card-foreground transition-colors group-hover/card:text-primary",
              isCompleted &&
                "text-muted-foreground line-through group-hover/card:text-muted-foreground",
            )}
          >
            {card.title}
          </h3>

          {(card.labels?.length ?? 0) > 0 || dueDate || card.assignedTo ? (
            <div className="mt-2 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
              {card.labels?.map((label, index) => (
                <span
                  key={index}
                  className="border border-border px-1.5 py-0.5 leading-none"
                >
                  {label}
                </span>
              ))}
              {dueDate && (
                <span className={cn("px-0.5", isOverdue && "text-destructive")}>
                  {format(dueDate, "MMM d")}
                </span>
              )}
              {card.assignedTo && (
                <Avatar className="ml-auto h-5 w-5">
                  <AvatarImage src={card.assignedTo.user.imageUrl ?? ""} />
                  <AvatarFallback className="text-[9px]">
                    {card.assignedTo.user.name?.[0] ?? ""}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);

CardBase.displayName = "CardBase";
