"use client";

import { Skeleton } from "~/components/ui/skeleton";

export function CardDetailsSkeleton() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="px-5 py-6 md:px-8">
        <Skeleton className="h-8 w-4/5" />
      </div>

      <div className="divide-y divide-border/60 border-y border-border">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className="grid grid-cols-[110px_1fr] items-center gap-4 px-5 py-2.5 md:px-8"
          >
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 px-5 py-6 md:px-8">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <div className="border-t border-border px-5 py-6 md:px-8">
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
  );
}
