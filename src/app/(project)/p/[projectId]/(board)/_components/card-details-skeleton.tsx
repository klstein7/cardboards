"use client";

import { Skeleton } from "~/components/ui/skeleton";

export function CardDetailsSkeleton() {
  return (
    <>
      {/* Header skeleton */}
      <div className="flex items-center gap-2 pb-4">
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
      <Skeleton className="mb-6 h-5 w-48" />

      <div className="flex flex-col gap-6">
        {/* Title skeleton */}
        <div className="rounded-lg border bg-card/50 p-4 shadow-sm backdrop-blur-[2px]">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>

        {/* Description skeleton */}
        <div className="rounded-lg border bg-card/50 p-4 shadow-sm backdrop-blur-[2px]">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>

        {/* Metadata and labels skeleton */}
        <div className="rounded-lg border bg-card/50 p-4 shadow-sm backdrop-blur-[2px]">
          {/* Metadata header */}
          <Skeleton className="mb-3 h-5 w-16" />

          {/* Grid for metadata */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Labels */}
          <div className="mt-4 flex flex-col gap-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </>
  );
}
