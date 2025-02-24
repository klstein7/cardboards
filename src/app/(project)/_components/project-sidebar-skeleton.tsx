"use client";

import { Skeleton } from "~/components/ui/skeleton";

export function ProjectSidebarSkeleton() {
  return (
    <div className="hidden w-14 shrink-0 flex-col items-center gap-12 border-r pb-3 pt-6 sm:flex">
      <div className="flex flex-1 flex-col items-center gap-12">
        {/* Project icon */}
        <Skeleton className="h-6 w-6" />

        {/* Main navigation buttons */}
        <div className="flex flex-col gap-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>

        {/* Board list */}
        <div className="flex flex-col gap-1">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}
