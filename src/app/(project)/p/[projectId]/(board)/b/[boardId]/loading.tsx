"use client";

import { Skeleton } from "~/components/ui/skeleton";

import { BoardPanoramaHeaderSkeleton } from "../../_components/board-panorama-header";
import { CardSkeleton } from "../../_components/card-skeleton";

export default function BoardPageSkeleton() {
  const lanes = [
    "sm:flex-[1.16_0_300px]",
    "sm:flex-[1.08_0_290px]",
    "sm:flex-[0.94_0_260px]",
    "sm:flex-[0.82_0_230px]",
  ];

  return (
    <div className="flex h-full w-full flex-col">
      <BoardPanoramaHeaderSkeleton />
      <main className="relative min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full min-w-full divide-x divide-border">
          {lanes.map((laneClassName, columnIndex) => (
            <div
              key={columnIndex}
              className={`flex min-w-0 flex-[0_0_calc(100vw-8px)] flex-col ${laneClassName}`}
            >
              <div className="flex h-11 items-center justify-between border-b border-border px-3.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-5" />
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
