import { Skeleton } from "~/components/ui/skeleton";

export default function MembersSettingsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b p-4 sm:p-6">
          <div>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="mt-1 h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Search and filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-10 w-24" />
            </div>

            {/* Data table */}
            <div className="rounded-md border">
              {/* Table header */}
              <div className="border-b">
                <Skeleton className="m-3 h-10 w-full" />
              </div>

              {/* Table rows */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b p-4 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex flex-col space-y-1">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <Skeleton className="h-5 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
