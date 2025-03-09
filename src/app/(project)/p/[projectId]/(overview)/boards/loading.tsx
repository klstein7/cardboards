import { TabsContent } from "~/components/ui/tabs";

export default function ProjectBoardsLoading() {
  return (
    <TabsContent value="boards" className="space-y-4">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b p-4 sm:p-6">
          <div>
            <div className="h-7 w-48 animate-pulse rounded-md bg-primary/10" />
            <div className="mt-1 h-4 w-64 animate-pulse rounded-md bg-primary/10" />
          </div>
        </div>

        <div className="p-4 pt-5 sm:p-6">
          {/* Search and filters */}
          <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="relative min-w-[200px] flex-1">
              <div className="h-10 w-full animate-pulse rounded-md bg-primary/10" />
            </div>

            {/* Sort select */}
            <div className="h-10 w-[180px] animate-pulse rounded-md bg-primary/10" />

            {/* View toggles */}
            <div className="flex">
              <div className="h-10 w-10 animate-pulse rounded-l-md bg-primary/10" />
              <div className="h-10 w-10 animate-pulse rounded-r-md bg-primary/10" />
            </div>
          </div>

          {/* Boards header */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-24 animate-pulse rounded-md bg-primary/10" />
              <div className="h-6 w-6 animate-pulse rounded-full bg-primary/10" />
            </div>

            <div className="h-9 w-28 animate-pulse rounded-md bg-primary/10" />
          </div>

          {/* Board grid */}
          <div className="mt-6 grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <BoardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </TabsContent>
  );
}

function BoardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-primary/10" />

        <div className="p-6 pt-8">
          {/* Title and icon */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="h-6 w-40 animate-pulse rounded-md bg-primary/10" />
              <div className="mt-1.5 h-4 w-24 animate-pulse rounded-md bg-primary/10" />
            </div>
            <div className="h-10 w-10 animate-pulse rounded-full bg-primary/10" />
          </div>

          {/* Progress bar */}
          <div className="mb-6 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 animate-pulse rounded-md bg-primary/10" />
              <div className="h-3 w-8 animate-pulse rounded-md bg-primary/10" />
            </div>
            <div className="h-2 w-full animate-pulse rounded-full bg-primary/10" />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/40 p-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 animate-pulse rounded-md bg-primary/10" />
                <div className="h-4 w-4 animate-pulse rounded-md bg-primary/10" />
              </div>
              <div className="mt-1 h-3 w-14 animate-pulse rounded-md bg-primary/10" />
            </div>

            <div className="rounded-lg bg-muted/40 p-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 animate-pulse rounded-md bg-primary/10" />
                <div className="h-4 w-4 animate-pulse rounded-md bg-primary/10" />
              </div>
              <div className="mt-1 h-3 w-10 animate-pulse rounded-md bg-primary/10" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 p-3">
          <div className="flex w-full items-center justify-end">
            <div className="h-4 w-20 animate-pulse rounded-md bg-primary/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
