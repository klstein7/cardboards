import { Skeleton } from "~/components/ui/skeleton";
import { TabsContent } from "~/components/ui/tabs";

export default function OverviewPageSkeleton() {
  return (
    <TabsContent value="overview" className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Trend Chart Skeleton */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="mt-4">
            <Skeleton className="h-[250px] w-full" />
          </div>
        </div>

        {/* Due Date and Priority Chart Skeletons */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Due Date Chart */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex h-[200px] items-center justify-center">
              <Skeleton className="h-[180px] w-[180px] rounded-full" />
            </div>
          </div>

          {/* Priority Chart */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 space-y-2">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-52" />
            </div>
            <div className="flex h-[200px] items-center justify-center">
              <Skeleton className="h-[180px] w-[180px] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
