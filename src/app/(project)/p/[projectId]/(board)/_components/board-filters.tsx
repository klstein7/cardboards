"use client";

import { X } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

import { useCachedCardsByCurrentBoard } from "~/lib/hooks";
import { cn } from "~/lib/utils";

export function BoardLabelFilter({ className }: { className?: string }) {
  const [labels, setLabels] = useQueryState(
    "labels",
    parseAsArrayOf(parseAsString),
  );

  const cards = useCachedCardsByCurrentBoard();

  const uniqueLabels = cards
    .flatMap((card) => card.labels)
    .filter((label): label is string => Boolean(label))
    .reduce(
      (unique, label) => (unique.includes(label) ? unique : [...unique, label]),
      [] as string[],
    )
    .sort();

  if (uniqueLabels.length === 0) {
    return null;
  }

  const toggleLabel = (label: string) => {
    if (labels?.includes(label)) {
      const remaining = labels.filter((value) => value !== label);
      void setLabels(remaining.length > 0 ? remaining : null);
    } else {
      void setLabels([...(labels ?? []), label]);
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {uniqueLabels.map((label) => {
        const isActive = labels?.includes(label) ?? false;
        return (
          <button
            key={label}
            onClick={() => toggleLabel(label)}
            aria-pressed={isActive}
            className={cn(
              "min-h-7 border px-1.5 py-1 font-mono text-[9px] uppercase leading-none tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              isActive
                ? "border-primary text-primary"
                : "border-border text-muted-foreground hover:border-foreground/60 hover:text-foreground",
            )}
          >
            {label}
          </button>
        );
      })}
      {labels && labels.length > 0 && (
        <button
          onClick={() => void setLabels(null)}
          className="flex min-h-7 items-center gap-1 px-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <X className="size-3" />
          Clear
        </button>
      )}
    </div>
  );
}
