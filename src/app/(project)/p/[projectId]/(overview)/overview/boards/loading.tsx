import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-6 w-56" />
      </div>
      <div className="divide-y divide-border border-t border-border">
        {[1, 2, 3].map((row) => (
          <div key={row} className="flex items-baseline justify-between py-5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
