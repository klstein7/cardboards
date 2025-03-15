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
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
