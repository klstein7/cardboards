import { Skeleton } from "~/components/ui/skeleton";

export function LoadingState() {
  return (
    <div className="h-full min-h-0 overflow-hidden lg:grid lg:grid-cols-[240px_minmax(0,1fr)_300px]">
      <aside className="border-b border-border lg:border-b-0 lg:border-r">
        <div className="border-b border-border px-4 py-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-5" />
          </div>
          <Skeleton className="mt-3 h-3 w-40" />
        </div>
        <div className="flex overflow-hidden lg:block">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="flex min-h-16 w-52 shrink-0 flex-col justify-center border-b border-r border-border px-4 lg:w-full lg:border-r-0"
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-2 w-16" />
            </div>
          ))}
        </div>
      </aside>

      <section className="border-b border-border px-4 py-8 sm:px-6 lg:border-b-0 lg:border-r lg:px-8">
        <div className="flex items-end justify-between border-b border-border pb-6">
          <div>
            <Skeleton className="h-7 w-44" />
            <Skeleton className="mt-3 h-3 w-32" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="grid grid-cols-[24px_1fr] gap-3 border-b border-border py-5"
          >
            <Skeleton className="h-6 w-6" />
            <div>
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="mt-2 h-2 w-2/5" />
            </div>
          </div>
        ))}
      </section>

      <aside className="hidden lg:block">
        <div className="border-b border-border px-5 py-6">
          <Skeleton className="h-2 w-12" />
          <Skeleton className="mt-3 h-6 w-32" />
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="mt-5 flex -space-x-1.5">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
        <div className="px-5 py-5">
          <Skeleton className="h-3 w-16" />
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="flex min-h-12 items-center gap-3 border-b border-border"
            >
              <Skeleton className="h-3 w-0.5" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
