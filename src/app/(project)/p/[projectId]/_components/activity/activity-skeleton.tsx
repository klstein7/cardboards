import { ActivityIcon } from "lucide-react";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

/**
 * Skeleton loading state for the activity component
 */
export function ActivitySkeleton() {
  return (
    <Card className="overflow-hidden border shadow">
      <CardHeader className="bg-muted/50 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-muted-foreground" />
            <Skeleton className="h-5 w-[100px]" />
          </div>
          <Skeleton className="hidden h-4 w-[180px] sm:block" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3 p-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-full max-w-[250px]" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
