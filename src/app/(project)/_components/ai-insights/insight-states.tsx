"use client";

import { Lightbulb } from "lucide-react";

import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

function InsightCardSkeleton({ index = 0 }: { index?: number }) {
  const animationDelay = `${index * 75}ms`;

  return (
    <Card
      className="motion-safe:animate-fadeIn group relative flex flex-col overflow-hidden border-border/60 bg-card/95 shadow-md dark:border-border/80 dark:bg-card/90"
      style={{
        animationDelay,
        animationFillMode: "both",
      }}
    >
      <Skeleton className="absolute bottom-0 left-0 top-0 w-1.5" />

      <div className="flex flex-1 flex-col p-4 pl-5">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="inline-flex h-6 items-center rounded-full border border-border/70 bg-background/95 px-2 py-1 dark:border-border/90 dark:bg-background/80">
            <Skeleton className="mr-1.5 h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>

          <div className="inline-flex h-6 items-center rounded-full border border-border/70 bg-background/95 px-2 py-1 dark:border-border/90 dark:bg-background/80">
            <Skeleton className="mr-1.5 h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>

        <Skeleton className="mb-2 h-4 w-4/5" />

        <Skeleton className="mb-1 h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </Card>
  );
}

export function InsightsLoading() {
  return (
    <div className="grid grid-cols-1 gap-3 px-3">
      <div
        className="motion-safe:animate-fadeIn mb-3 text-center"
        style={{ animationDelay: "0ms" }}
      >
        <p className="text-sm font-medium text-muted-foreground">
          Loading insights
        </p>
      </div>

      {Array.from({ length: 4 }).map((_, index) => (
        <InsightCardSkeleton key={index} index={index} />
      ))}
    </div>
  );
}

export function InsightsEmpty() {
  return (
    <div className="motion-safe:animate-fadeIn flex flex-col items-center justify-center gap-3 rounded-md bg-muted/50 py-12 text-center">
      <Lightbulb className="h-12 w-12 text-amber-500/50" />
      <div>
        <p className="text-muted-foreground">No insights available yet.</p>
        <p className="mt-1 text-xs text-muted-foreground/80">
          Generate insights to get AI-powered suggestions for your project or
          board.
        </p>
      </div>
    </div>
  );
}

export function InsightsGenerating() {
  return (
    <div className="grid grid-cols-1 gap-3 px-3">
      <div
        className="motion-safe:animate-fadeIn mb-3 text-center"
        style={{ animationDelay: "0ms" }}
      >
        <p className="mb-1 text-sm font-medium text-primary">
          Generating insights
        </p>
        <p className="text-xs text-muted-foreground">
          This may take a few moments...
        </p>
      </div>

      {Array.from({ length: 3 }).map((_, index) => (
        <InsightCardSkeleton key={index} index={index} />
      ))}
    </div>
  );
}
