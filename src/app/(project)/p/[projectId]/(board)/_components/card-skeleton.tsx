"use client";

import { Skeleton } from "~/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="relative flex select-none flex-col gap-1.5 pl-4">
      <Skeleton className="absolute left-0 top-[3px] h-3.5 w-0.5" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </div>
  );
}
