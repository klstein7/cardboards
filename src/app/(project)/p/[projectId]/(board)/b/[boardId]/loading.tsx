"use client";

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

import { CardSkeleton } from "../../_components/card-skeleton";

export default function BoardPageSkeleton() {
  return (
    <div className="flex h-[100dvh] w-full flex-col">
      {/* Board Header (matching BoardHeader component) */}
      <div className="border-b px-4 py-4 sm:px-6 lg:px-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <Skeleton className="h-4 w-32" />
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </BreadcrumbItem>
        </BreadcrumbList>
      </div>

      {/* Board Toolbar (matching BoardToolbar component) */}
      <div className="flex w-full border-y px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex w-full flex-wrap items-center justify-between">
          {/* Mobile filters */}
          <div className="flex items-center gap-2 sm:hidden">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="flex items-center gap-1.5"
            >
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Skeleton className="h-4 w-20" />
            </Button>
          </div>

          {/* Desktop filters */}
          <div className="hidden grow sm:block">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-[180px]" />
                <Skeleton className="h-9 w-[180px]" />
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>

          {/* Generate button for desktop */}
          <div className="ml-auto hidden sm:block">
            <Button variant="outline" size="sm" disabled>
              <Skeleton className="h-4 w-20" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content - Column List */}
      <main className="flex-1 overflow-hidden">
        <div className="scrollbar-thumb-rounded-full h-full w-full overflow-y-auto scrollbar-thin scrollbar-track-transparent">
          <div className="flex w-fit items-start gap-5 p-5">
            {/* Columns */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-full w-[300px] flex-shrink-0">
                <div className="flex h-full flex-col gap-3 rounded-md border bg-secondary/20 p-4">
                  {/* Column header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-5 w-8 rounded-md" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>

                  {/* Cards */}
                  <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                    {[1, 2].map((j) => (
                      <CardSkeleton key={j} />
                    ))}
                  </div>

                  {/* Add card button */}
                  <div className="flex items-center justify-center">
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>
              </div>
            ))}

            {/* Add column placeholder */}
            <div className="h-[100px] w-[300px] flex-shrink-0">
              <Skeleton className="h-full w-full rounded-md" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
