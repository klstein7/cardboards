import { Skeleton } from "~/components/ui/skeleton";

export default function BoardsSettingsPageSkeleton() {
  return (
    <div className="flex h-full flex-col gap-6">
      <h4 className="text-lg font-medium">Boards</h4>
      <div className="flex-1 pb-6">
        <div className="flex max-w-xl flex-col gap-2">
          {/* Board items */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="overflow-hidden">
              <div className="flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-sm" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
