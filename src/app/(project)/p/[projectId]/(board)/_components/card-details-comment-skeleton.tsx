"use client";

import { Skeleton } from "~/components/ui/skeleton";

export function CardDetailsCommentSkeleton() {
  return (
    <div className="flex gap-3 py-4">
      <Skeleton className="h-5 w-5 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
  );
}
