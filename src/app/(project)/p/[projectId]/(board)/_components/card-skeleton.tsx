"use client";

import { Skeleton } from "~/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="relative flex cursor-pointer select-none flex-col gap-2 p-1 sm:gap-3 sm:p-0">
      <div className="relative flex w-full flex-col gap-3 border border-l-4 bg-secondary/20 p-4">
        {/* Creation date and due date */}
        <div className="flex items-center justify-between text-xs">
          <Skeleton className="h-3 w-20" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3.5 w-3.5" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Title and description */}
        <div className="flex flex-col">
          <Skeleton className="h-5 w-3/4" />
          <div className="prose prose-sm prose-invert line-clamp-2">
            <Skeleton className="mt-1.5 h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        {/* Labels, priority and avatar */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-7 w-7 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
