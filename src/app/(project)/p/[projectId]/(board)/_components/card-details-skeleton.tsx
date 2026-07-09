"use client";

import { Skeleton } from "~/components/ui/skeleton";

export function CardDetailsSkeleton() {
  return (
    <div className="grid min-h-0 flex-1 md:grid-cols-[1fr_240px] md:divide-x md:divide-border">
      <div className="min-w-0 px-5 py-6 md:px-7">
        <Skeleton className="h-8 w-4/5" />
        <div className="mt-6 flex flex-col gap-3">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="mt-8 border-t border-border pt-5">
          <Skeleton className="h-3.5 w-20" />
          <div className="mt-4 flex gap-3 py-4">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden flex-col gap-6 px-5 py-6 md:flex">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
