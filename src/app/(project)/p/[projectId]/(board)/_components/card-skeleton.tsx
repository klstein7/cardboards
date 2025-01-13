"use client";

import { Skeleton } from "~/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="relative flex cursor-pointer select-none flex-col gap-3">
      <div className="relative flex flex-col gap-3 border bg-secondary/20 p-4">
        {/* Date and calendar */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>

        {/* Title and description */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Labels, priority and avatar */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex items-end justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-7 w-7 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
