import { TabsContent } from "~/components/ui/tabs";

export default function ProjectActivityLoading() {
  return (
    <TabsContent value="activity" className="space-y-4">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b p-4 sm:p-6">
          <div>
            <div className="h-7 w-48 animate-pulse rounded-md bg-primary/10" />
            <div className="mt-1 h-4 w-64 animate-pulse rounded-md bg-primary/10" />
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Activity list skelton */}
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ActivityItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </TabsContent>
  );
}

function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
      {/* Avatar */}
      <div className="h-10 w-10 animate-pulse rounded-full bg-primary/10" />

      <div className="flex-1 space-y-2">
        {/* Event info */}
        <div className="flex flex-wrap items-center gap-1">
          <div className="h-4 w-24 animate-pulse rounded-md bg-primary/10" />
          <div className="h-4 w-16 animate-pulse rounded-md bg-primary/10" />
          <div className="h-4 w-32 animate-pulse rounded-md bg-primary/10" />
        </div>

        {/* Event description */}
        <div className="h-4 w-3/4 animate-pulse rounded-md bg-primary/10" />

        {/* Timestamp */}
        <div className="h-3.5 w-20 animate-pulse rounded-md bg-primary/10" />
      </div>
    </div>
  );
}
