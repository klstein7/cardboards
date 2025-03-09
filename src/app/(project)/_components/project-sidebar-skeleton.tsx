"use client";

import { Skeleton } from "~/components/ui/skeleton";

export function ProjectSidebarSkeleton() {
  return (
    <aside className="hidden shrink-0 border-r transition-all duration-300 ease-in-out sm:block md:w-[60px] lg:w-[240px]">
      <div className="flex h-full flex-col py-6">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center px-4 lg:justify-start">
          <Skeleton className="h-6 w-6 flex-shrink-0" />
          <Skeleton className="ml-3 hidden h-5 w-24 lg:block" />
        </div>

        {/* Main Navigation */}
        <div className="space-y-1 px-3">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Boards Section */}
        <div className="mt-8 px-3">
          <div className="mb-2 flex items-center">
            <Skeleton className="hidden h-4 w-16 lg:block" />
            <Skeleton className="ml-auto h-8 w-8 rounded-md" />
          </div>

          <div className="mt-1 space-y-1">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto space-y-2 px-3">
          <div className="flex justify-center lg:justify-start">
            <Skeleton className="h-9 w-9 rounded-md lg:w-[100px]" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="flex justify-center py-2 lg:justify-start">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </aside>
  );
}
