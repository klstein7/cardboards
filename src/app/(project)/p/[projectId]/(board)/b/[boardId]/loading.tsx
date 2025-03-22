"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BoardPageSkeleton() {
  return (
    <div className="flex h-full w-full flex-col">
      {/* Board toolbar area */}
      <div className="flex w-full border-y px-4 py-3 sm:px-6">
        <div className="flex w-full flex-wrap items-center justify-between">
          {/* Mobile filters */}
          <div className="flex items-center gap-2 sm:hidden">
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted/50" />
          </div>

          {/* Desktop filters */}
          <div className="hidden grow sm:block">
            <div className="flex flex-wrap gap-2">
              <div className="h-9 w-44 animate-pulse rounded-md bg-muted/50" />
              <div className="h-9 w-44 animate-pulse rounded-md bg-muted/50" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content with columns */}
      <main className="relative flex-1 overflow-hidden px-4 pb-6 pt-3 sm:px-6">
        <div className="relative h-full w-full">
          {/* Left scroll button */}
          <button
            className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow-md"
            disabled
          >
            <ChevronLeft className="h-6 w-6 text-muted-foreground" />
          </button>

          {/* Scrollable column container */}
          <div className="h-full w-full overflow-x-auto overflow-y-auto scrollbar scrollbar-track-transparent">
            <div className="flex w-fit items-start gap-5 pb-2">
              {/* Column skeletons - matching 325px width from actual component */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-full w-[325px] flex-shrink-0">
                  <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border bg-card/30 shadow-sm">
                    {/* Column header */}
                    <div className="flex items-center justify-between border-b bg-card/50 p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-28 animate-pulse rounded bg-muted/50" />
                        <div className="h-5 w-6 animate-pulse rounded-full bg-muted/50" />
                      </div>
                      <div className="h-8 w-8 animate-pulse rounded-md bg-muted/50" />
                    </div>

                    {/* Cards */}
                    <div className="flex-1 overflow-y-auto p-2">
                      <div className="flex flex-col space-y-3 p-2">
                        {[1, 2].map((j) => (
                          <div
                            key={j}
                            className="group relative flex flex-col gap-3 rounded-lg border border-l-4 bg-card/50 p-4 shadow-sm"
                          >
                            {/* Card header */}
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1">
                                <div className="h-3 w-14 animate-pulse rounded bg-muted/50" />
                                <div className="h-3 w-20 animate-pulse rounded bg-muted/50" />
                              </div>
                              <div className="h-5 w-20 animate-pulse rounded-full bg-muted/50" />
                            </div>

                            {/* Card content */}
                            <div className="flex flex-col space-y-2">
                              <div className="h-5 w-3/4 animate-pulse rounded bg-muted/50" />
                              <div className="space-y-1">
                                <div className="h-3 w-full animate-pulse rounded bg-muted/50" />
                                <div className="h-3 w-2/3 animate-pulse rounded bg-muted/50" />
                              </div>
                            </div>

                            {/* Card footer */}
                            <div className="mt-auto flex flex-col gap-2.5">
                              <div className="flex flex-wrap gap-1.5">
                                <div className="h-6 w-16 animate-pulse rounded-md bg-muted/50" />
                                <div className="h-6 w-20 animate-pulse rounded-md bg-muted/50" />
                              </div>
                              <div className="flex items-end justify-between">
                                <div className="h-6 w-24 animate-pulse rounded-full bg-muted/50" />
                                <div className="h-7 w-7 animate-pulse rounded-full bg-muted/50" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add card button */}
                    <div className="border-t p-2">
                      <div className="flex h-10 w-full items-center gap-2 rounded-md bg-muted/30 px-3">
                        <div className="h-4 w-4 animate-pulse rounded bg-muted/50" />
                        <div className="h-4 w-16 animate-pulse rounded bg-muted/50" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add column button */}
              <div className="flex h-11 w-[325px] flex-shrink-0 items-center justify-center rounded-md border border-dashed bg-card/20 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-pulse rounded-full bg-muted/50" />
                  <div className="h-5 w-28 animate-pulse rounded bg-muted/50" />
                </div>
              </div>
            </div>
          </div>

          {/* Right scroll button */}
          <button
            className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow-md"
            disabled
          >
            <ChevronRight className="h-6 w-6 text-muted-foreground" />
          </button>

          {/* Left gradient */}
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-12 bg-gradient-to-r from-background to-transparent opacity-50" />

          {/* Right gradient */}
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-12 bg-gradient-to-l from-background to-transparent opacity-50" />
        </div>
      </main>
    </div>
  );
}
