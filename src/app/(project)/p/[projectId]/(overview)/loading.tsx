export default function OverviewLoading() {
  // This component renders just the content skeleton without the tabs
  // since tabs are already in the layout
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b p-4 sm:p-6">
          <div>
            <div className="h-7 w-48 animate-pulse rounded-md bg-primary/10" />
            <div className="mt-1 h-4 w-64 animate-pulse rounded-md bg-primary/10" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-md bg-primary/10" />
        </div>

        <div className="p-4 sm:p-6">
          {/* Search bar / Filter area */}
          <div className="mb-4 flex items-center space-x-2">
            <div className="relative flex-1">
              <div className="h-9 w-full animate-pulse rounded-md bg-primary/10" />
            </div>
          </div>

          {/* Grid or list content */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-primary/10" />
                  <div className="h-4 w-24 animate-pulse rounded-md bg-primary/10" />
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-20 animate-pulse rounded-md bg-primary/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
