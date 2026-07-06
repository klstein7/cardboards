"use client";

import { Skeleton } from "~/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="max-w-xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}
