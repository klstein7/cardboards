import { TabsContent } from "~/components/ui/tabs";

export default function ProjectMembersLoading() {
  return (
    <TabsContent value="members" className="space-y-6">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b p-4 sm:p-6">
          <div>
            <div className="h-7 w-48 animate-pulse rounded-md bg-primary/10" />
            <div className="mt-1 h-4 w-64 animate-pulse rounded-md bg-primary/10" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-md bg-primary/10" />
        </div>

        <div className="p-4 sm:p-6">
          {/* Search bar */}
          <div className="mb-4 flex items-center space-x-2">
            <div className="relative flex-1">
              <div className="h-9 w-full animate-pulse rounded-md bg-primary/10" />
            </div>
          </div>

          {/* Table header */}
          <div className="mb-2 grid grid-cols-4 gap-4 rounded-md border-b pb-3">
            <div className="h-4 w-20 animate-pulse rounded-md bg-primary/10" />
            <div className="h-4 w-20 animate-pulse rounded-md bg-primary/10" />
            <div className="h-4 w-20 animate-pulse rounded-md bg-primary/10" />
            <div className="h-4 w-20 animate-pulse rounded-md bg-primary/10" />
          </div>

          {/* Table rows */}
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-primary/10" />
                  <div className="h-4 w-24 animate-pulse rounded-md bg-primary/10" />
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-20 animate-pulse rounded-md bg-primary/10" />
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-32 animate-pulse rounded-md bg-primary/10" />
                </div>
                <div className="flex items-center justify-end">
                  <div className="h-9 w-9 animate-pulse rounded-md bg-primary/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
