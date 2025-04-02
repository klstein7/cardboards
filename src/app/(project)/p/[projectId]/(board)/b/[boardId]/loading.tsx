"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Skeleton } from "~/components/ui/skeleton";

export default function BoardPageSkeleton() {
  return (
    <div className="flex h-full w-full flex-col">
      <main className="relative flex-1 overflow-hidden">
        {/* Column List Skeleton - based on ColumnList component */}
        <div className="relative h-full w-full">
          {/* Left scroll button */}
          <button
            className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow-md sm:flex"
            disabled
          >
            <ChevronLeft className="h-6 w-6 text-muted-foreground" />
          </button>

          {/* Scrollable column container */}
          <div className="h-full w-full overflow-x-auto sm:scrollbar sm:scrollbar-track-transparent sm:scrollbar-thumb-primary/40 sm:hover:scrollbar-thumb-primary/60 sm:dark:scrollbar-thumb-primary/30 sm:dark:hover:scrollbar-thumb-primary/50">
            <div className="flex h-full w-fit items-start gap-3 p-3 sm:gap-5 sm:p-6">
              {/* Column skeletons - matching layout from ColumnItem component */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-full w-[calc(100vw-24px)] flex-shrink-0 sm:w-[325px]"
                >
                  <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border bg-card/30 shadow-sm">
                    {/* Column header */}
                    <div className="flex items-center justify-between border-b bg-card/50 p-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-28 rounded" />
                        <Skeleton className="h-5 w-6 rounded-full" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-md" />
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
                                <Skeleton className="h-3 w-14 rounded" />
                                <Skeleton className="h-3 w-20 rounded" />
                              </div>
                              <Skeleton className="h-5 w-20 rounded-full" />
                            </div>

                            {/* Card content */}
                            <div className="flex flex-col space-y-2">
                              <Skeleton className="h-5 w-3/4 rounded" />
                              <div className="space-y-1">
                                <Skeleton className="h-3 w-full rounded" />
                                <Skeleton className="h-3 w-2/3 rounded" />
                              </div>
                            </div>

                            {/* Card footer */}
                            <div className="mt-auto flex flex-col gap-2.5">
                              <div className="flex flex-wrap gap-1.5">
                                <Skeleton className="h-6 w-16 rounded-md" />
                                <Skeleton className="h-6 w-20 rounded-md" />
                              </div>
                              <div className="flex items-end justify-between">
                                <Skeleton className="h-6 w-24 rounded-full" />
                                <Skeleton className="h-7 w-7 rounded-full" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add card button */}
                    <div className="border-t p-2">
                      <div className="flex h-10 w-full items-center gap-2 rounded-md bg-muted/30 px-3">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-16 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add column button */}
              <div className="flex h-11 w-[325px] flex-shrink-0 items-center justify-center rounded-md border border-dashed bg-card/20 p-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-28 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Right scroll button */}
          <button
            className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow-md sm:flex"
            disabled
          >
            <ChevronRight className="h-6 w-6 text-muted-foreground" />
          </button>

          {/* Left gradient */}
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 hidden w-12 bg-gradient-to-r from-background to-transparent opacity-50 sm:block" />

          {/* Right gradient */}
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 hidden w-12 bg-gradient-to-l from-background to-transparent opacity-50 sm:block" />
        </div>

        {/* Card Details Skeleton - Hidden by default but included for structure matching */}
        <div className="hidden">
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
              {/* Header skeleton */}
              <div className="flex items-center gap-2 pb-4">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <Skeleton className="mb-6 h-5 w-48" />

              <div className="flex flex-col gap-6">
                {/* Title skeleton */}
                <div className="rounded-lg border bg-card/50 p-4 shadow-sm backdrop-blur-[2px]">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>

                {/* Description skeleton */}
                <div className="rounded-lg border bg-card/50 p-4 shadow-sm backdrop-blur-[2px]">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </div>

                {/* Metadata skeleton */}
                <div className="rounded-lg border bg-card/50 p-4 shadow-sm backdrop-blur-[2px]">
                  <Skeleton className="mb-3 h-5 w-16" />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
