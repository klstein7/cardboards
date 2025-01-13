"use client";

import { Skeleton } from "~/components/ui/skeleton";

export function CardDetailsCommentSkeleton() {
  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <Skeleton className="h-8 w-8 rounded-full" />

      <div className="flex grow flex-col gap-3">
        {/* Name and time */}
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-4 w-24" /> {/* Name */}
          <Skeleton className="h-3 w-20" /> {/* Time */}
        </div>

        {/* Comment content */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
