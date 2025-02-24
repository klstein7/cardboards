"use client";

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Skeleton } from "~/components/ui/skeleton";

import { CardSkeleton } from "../../_components/card-skeleton";

export default function BoardPageSkeleton() {
  return (
    <div className="flex h-[100dvh] w-full">
      <div className="flex w-full flex-col">
        <BreadcrumbList className="p-6">
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <Skeleton className="h-4 w-32" />
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <Skeleton className="h-4 w-24" />
          </BreadcrumbItem>
        </BreadcrumbList>

        <div className="flex max-w-7xl justify-between px-6 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-8 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>

        {/* Column List */}
        <div className="scrollbar-thumb-rounded-full overflow-y-auto border-t scrollbar-thin scrollbar-track-transparent scrollbar-thumb-secondary/50">
          <div className="flex w-full max-w-7xl flex-col items-start gap-3 overflow-x-auto p-6 sm:flex-row sm:gap-6">
            {/* Multiple columns */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex w-full flex-col gap-3 rounded-md border bg-secondary/20 p-4"
              >
                {/* Column header */}
                <Skeleton className="h-6 w-32" />

                {/* Cards */}
                <div className="flex flex-col [&>*:not(:first-child)]:mt-[-1px]">
                  <CardSkeleton />
                </div>

                {/* Add card button */}
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
