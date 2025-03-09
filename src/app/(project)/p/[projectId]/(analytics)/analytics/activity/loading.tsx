import { Skeleton } from "~/components/ui/skeleton";
import { TabsContent } from "~/components/ui/tabs";

export default function ActivityPageSkeleton() {
  return (
    <TabsContent value="activity" className="space-y-6">
      <div className="grid gap-6 md:grid-cols-1">
        {/* Activity Chart Skeleton */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>

          {/* Activity Chart */}
          <div className="mt-6">
            <Skeleton className="h-[300px] w-full" />
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
