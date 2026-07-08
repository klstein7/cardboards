"use client";

import { Skeleton } from "~/components/ui/skeleton";

import { CardSkeleton } from "../../_components/card-skeleton";

export default function BoardPageSkeleton() {
  return (
    <div className="flex h-full w-full flex-col">
      <main className="relative flex-1 overflow-hidden">
        <div className="grid h-full auto-cols-[calc(100vw-8px)] grid-flow-col grid-rows-[minmax(0,1fr)] divide-x divide-border sm:auto-cols-[minmax(280px,1fr)]">
          {[1, 2, 3, 4].map((columnIndex) => (
            <div key={columnIndex} className="flex min-w-0 flex-col">
              <div className="flex h-9 items-center justify-between border-b border-border px-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-5" />
              </div>
              <div className="flex-1 divide-y divide-border/60 overflow-hidden">
                {Array.from({ length: 2 + (columnIndex % 2) }).map(
                  (_, cardIndex) => (
                    <CardSkeleton key={cardIndex} />
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
