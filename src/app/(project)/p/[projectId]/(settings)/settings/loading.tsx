"use client";

import { Skeleton } from "~/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b p-4 sm:p-6">
          <div>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="mt-1 h-4 w-64" />
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* Project name field */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-4 w-64" />
            </div>

            {/* Project description field */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-24 w-full max-w-md" />
              <Skeleton className="h-4 w-72" />
            </div>

            {/* Submit button */}
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
