import { Skeleton } from "~/components/ui/skeleton";

export function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((panelIndex) => (
        <div key={panelIndex} className="flex min-h-56 flex-col bg-background">
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-5" />
          </div>
          <div className="flex-1 divide-y divide-border/60">
            {Array.from({ length: 2 + (panelIndex % 2) }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="flex items-center gap-2.5 px-3 py-2"
              >
                <Skeleton className="h-3 w-0.5" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
          <div className="flex h-9 shrink-0 items-center justify-between border-t border-border px-3">
            <div className="flex -space-x-1.5">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
