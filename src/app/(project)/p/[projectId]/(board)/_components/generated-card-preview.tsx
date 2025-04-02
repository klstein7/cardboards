"use client";

import { Check } from "lucide-react";
import { memo } from "react";

import { cn, getColor, getPriorityByValue, type Priority } from "~/lib/utils";
import { type GeneratedCardSchema } from "~/server/zod";

interface GeneratedCardPreviewProps {
  card: Zod.infer<typeof GeneratedCardSchema>;
  isSelected: boolean;
  onClick: () => void;
}

export const GeneratedCardPreview = memo(
  ({ card, isSelected, onClick }: GeneratedCardPreviewProps) => {
    const priority = getPriorityByValue(card.priority as Priority["value"]);
    const priorityColor = priority
      ? getColor(card.priority as Priority["value"])
      : undefined;

    return (
      <div
        onClick={onClick}
        className={cn(
          "group relative flex cursor-pointer flex-col gap-1.5 rounded-lg border border-border/50 bg-card/30 p-3 transition-all duration-150",
          "hover:bg-muted/60",
          isSelected && [
            "ring-2 ring-primary ring-offset-1 ring-offset-background",
          ],
        )}
      >
        {/* Checkmark for selected state */}
        {isSelected && (
          <div className="absolute right-2 top-2 z-10 rounded-full bg-primary p-1 shadow-sm transition-opacity duration-200">
            <Check className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
        )}
        {/* Subtle background gradient for selected state */}
        {isSelected && (
          <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-tr from-primary/5 to-primary/10" />
        )}

        {/* Card Content */}
        <div className="flex items-start gap-2">
          {/* Priority Dot (if applicable) */}
          {priority && (
            <span
              className="mt-[0.4rem] h-2 w-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: priorityColor }}
            />
          )}
          <h3 className="line-clamp-2 flex-1 text-sm font-medium tracking-tight">
            {card.title}
          </h3>
        </div>

        {card.description && (
          <div
            className="prose prose-sm prose-invert line-clamp-2 pl-4 text-xs text-muted-foreground dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: card.description ?? "" }}
          />
        )}

        {/* Footer: Labels */}
        <div className="mt-auto flex flex-col gap-1 pt-1">
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 pl-4">
              {card.labels.map((label, index) => (
                <div
                  key={index}
                  className="rounded bg-secondary/70 px-1.5 py-0.5 text-[10px] font-normal text-secondary-foreground/90"
                >
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
);

GeneratedCardPreview.displayName = "GeneratedCardPreview";
