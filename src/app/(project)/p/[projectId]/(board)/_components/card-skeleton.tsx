"use client";

import { Skeleton } from "~/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="flex select-none items-stretch gap-3 px-3.5 py-3">
      <Skeleton className="w-0.5 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
        <div className="mt-0.5 flex items-center gap-2">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="ml-auto h-5 w-5 rounded-full" />
        </div>
      </div>
    </div>
  );
}
