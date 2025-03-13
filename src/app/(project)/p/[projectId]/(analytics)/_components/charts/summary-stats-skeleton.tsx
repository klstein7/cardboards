import { Skeleton } from "~/components/ui/skeleton";

export function SummaryStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Tasks */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="mt-3">
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="mt-2 h-4 w-40" />
      </div>

      {/* Completion Rate */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="mt-3">
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="mt-2 h-4 w-40" />
      </div>

      {/* Active Users */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="mt-3">
          <Skeleton className="h-8 w-10" />
        </div>
        <Skeleton className="mt-2 h-4 w-40" />
      </div>

      {/* Total Boards */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="mt-3">
          <Skeleton className="h-8 w-12" />
        </div>
        <Skeleton className="mt-2 h-4 w-40" />
      </div>
    </div>
  );
}
