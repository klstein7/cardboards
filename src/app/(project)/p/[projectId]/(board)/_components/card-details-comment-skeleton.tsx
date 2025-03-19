"use client";

import { Skeleton } from "~/components/ui/skeleton";

export function CardDetailsCommentSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-md border border-border/40 bg-card/30 p-4 shadow-md">
      {/* Left accent border */}
      <div className="absolute inset-y-0 left-0 w-1 bg-primary/30"></div>

      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-baseline gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
