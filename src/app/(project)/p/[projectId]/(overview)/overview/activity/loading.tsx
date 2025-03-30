import { ActivityIcon } from "lucide-react";

import { SectionHeader } from "~/components/shared/section-header";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { TabsContent } from "~/components/ui/tabs";

export default function Loading() {
  return (
    <TabsContent value="activity" className="space-y-4">
      <Card className="overflow-hidden border shadow-sm transition-all hover:shadow">
        <SectionHeader title="Project Activity" icon={ActivityIcon} />
        <CardContent className="p-0">
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-4 border-b p-4 last:border-b-0"
              >
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2 pt-0.5">
                  <Skeleton className="h-4 w-full max-w-md" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
