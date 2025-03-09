import { Skeleton } from "~/components/ui/skeleton";
import { TabsContent } from "~/components/ui/tabs";

export default function ProgressPageSkeleton() {
  return (
    <TabsContent value="progress" className="space-y-6">
      {/* Progress Chart Skeleton */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-4 space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
        <div className="space-y-6 py-4">
          {/* Board Progress Bars */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-10" />
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <Skeleton
                  className={`h-full w-${[70, 45, 90, 30, 60][i % 5]}%`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </TabsContent>
  );
}
