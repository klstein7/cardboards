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
      <div className="absolute bottom-0 left-0 top-0 w-1.5 animate-pulse bg-primary/50" />

      <div className="flex flex-1 flex-col p-4 pl-5">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border/70 bg-background/95 px-2 py-1 dark:border-border/90 dark:bg-background/80">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>

          <div className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border/70 bg-background/95 px-2 py-1 dark:border-border/90 dark:bg-background/80">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>

        <Skeleton className="mb-2 h-4 w-4/5" />

        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-11/12" />
        </div>
      </div>
    </Card>
  );
}

export function InsightsLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 px-3">
      <div
        className="motion-safe:animate-fadeIn mb-2 flex flex-col items-center justify-center rounded-lg border border-border/40 bg-gradient-to-b from-background to-muted/30 p-6 text-center shadow-sm"
        style={{ animationDelay: "0ms" }}
      >
        <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-primary/10">
          <Lightbulb className="h-6 w-6 text-primary/60" />
        </div>
        <p className="mt-4 text-sm font-medium text-primary">
          Loading insights
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Please wait while we retrieve your insights...
        </p>
      </div>

      {Array.from({ length: 3 }).map((_, index) => (
        <InsightCardSkeleton key={index} index={index} />
      ))}
    </div>
  );
}

export function InsightsEmpty() {
  return (
    <div className="motion-safe:animate-fadeIn flex flex-col items-center justify-center gap-4 rounded-lg border border-border/40 bg-gradient-to-b from-background to-muted/30 p-8 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 ring-2 ring-amber-500/20">
        <Lightbulb className="h-8 w-8 text-amber-500" />
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-medium text-foreground">
          No insights available yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Generate insights to get AI-powered suggestions for your project or
          board.
        </p>
      </div>
      <div className="mt-2 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
        Click the &quot;Generate new insights&quot; button above to get started
      </div>
    </div>
  );
}

export function InsightsGenerating() {
  return (
    <div className="grid grid-cols-1 gap-4 px-3">
      <div
        className="motion-safe:animate-fadeIn mb-2 flex flex-col items-center justify-center rounded-lg border border-border/40 bg-gradient-to-b from-background to-muted/30 p-6 text-center shadow-sm"
        style={{ animationDelay: "0ms" }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <p className="mt-4 text-sm font-medium text-primary">
          Generating insights
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          This may take a few moments...
        </p>
      </div>

      {Array.from({ length: 2 }).map((_, index) => (
        <InsightCardSkeleton key={index} index={index} />
      ))}
    </div>
  );
}
