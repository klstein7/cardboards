"use client";

import { Skeleton } from "~/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="flex select-none items-center gap-2.5 px-3 py-2">
      <Skeleton className="h-3 w-0.5 shrink-0" />
      <Skeleton className="h-3.5 min-w-0 flex-1" />
      <Skeleton className="h-3 w-10 shrink-0" />
      <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
    </div>
  );
}
