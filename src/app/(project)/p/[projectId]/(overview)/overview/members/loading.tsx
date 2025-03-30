import { UsersIcon } from "lucide-react";

import { SectionHeader } from "~/components/shared/section-header";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { TabsContent } from "~/components/ui/tabs";

export default function Loading() {
  return (
    <TabsContent value="members" className="space-y-6">
      <Card className="rounded-lg border bg-card shadow-sm">
        <SectionHeader
          title="Project Members"
          icon={UsersIcon}
          actions={<Skeleton className="h-9 w-[110px]" />}
        />
        <CardContent className="p-4 sm:p-6">
          <div className="rounded-md border">
            <div className="flex items-center gap-4 border-b px-4 py-3">
              <Skeleton className="h-4 max-w-[200px] flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="flex flex-1 items-center gap-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16 rounded-md" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
