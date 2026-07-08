"use client";

import { Skeleton } from "~/components/ui/skeleton";

import { CardSkeleton } from "../../_components/card-skeleton";

export default function BoardPageSkeleton() {
  return (
    <div className="flex h-full w-full flex-col">
      <main className="relative flex-1 overflow-hidden">
        <div className="flex h-full items-stretch divide-x divide-border">
          {[1, 2, 3, 4].map((columnIndex) => (
            <div
              key={columnIndex}
              className="flex w-[calc(100vw-8px)] shrink-0 flex-col sm:w-auto sm:min-w-[340px] sm:flex-1"
            >
              <div className="flex items-center gap-2 px-6 pb-4 pt-5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-5" />
              </div>
              <div className="flex-1 space-y-6 overflow-hidden px-6 pt-1">
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
