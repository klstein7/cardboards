import { Skeleton } from "~/components/ui/skeleton";

export default function BoardsSettingsPageSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 md:p-6">
          <div>
            <Skeleton className="h-7 w-48 sm:h-8" />
            <Skeleton className="mt-1 h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          <div className="mb-4">
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Board count and new board button */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>

            {/* Board list */}
            <div className="divide-y rounded-lg border bg-card">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Skeleton className="h-3 w-3 rounded-full sm:h-4 sm:w-4" />
                    <Skeleton className="h-5 w-48" />
                    <div className="ml-1 flex items-center gap-1 sm:ml-2 sm:gap-2">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="hidden h-5 w-24 sm:block" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
