import { ActivityIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { TabsContent } from "~/components/ui/tabs";

export default function Loading() {
  return (
    <TabsContent value="activity" className="space-y-4">
      <Card className="overflow-hidden border shadow-sm transition-all hover:shadow">
        <CardHeader className="bg-muted/40 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="rounded-full bg-primary/10 p-1.5 shadow-sm">
                <ActivityIcon className="h-4 w-4 text-primary" />
              </div>
              <CardTitle>Activity</CardTitle>
            </div>
          </div>
        </CardHeader>
        <Separator className="opacity-60" />
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-start gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border/50 p-4">
            <div className="flex items-center justify-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
