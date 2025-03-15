import { UsersIcon } from "lucide-react";

import { SectionHeader } from "~/components/shared/section-header";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { TabsContent } from "~/components/ui/tabs";

export default function Loading() {
  return (
    <TabsContent value="members" className="space-y-6">
      <Card className="rounded-lg border bg-card shadow-sm">
        <SectionHeader title="Project Members" icon={UsersIcon} />
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-9 w-32" />
            </div>
            <div className="rounded-md border">
              <div className="border-b px-4 py-3">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="divide-y">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="mt-1 h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
