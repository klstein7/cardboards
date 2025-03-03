import { Skeleton } from "~/components/ui/skeleton";

export default function MembersSettingsPageSkeleton() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h4 className="text-lg font-medium">Members</h4>
      <div className="flex justify-between gap-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Data table skeleton */}
      <div className="space-y-4">
        {/* Table header */}
        <div className="rounded-md border">
          <div className="flex items-center gap-3 border-b p-3">
            <Skeleton className="h-5 w-5" />
            <div className="flex flex-1 items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>

          {/* Table rows */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b p-4 last:border-0"
            >
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex flex-1 items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-9 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
