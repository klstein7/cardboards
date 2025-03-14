"use client";

import { Ellipsis, Filter, Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

// Board column skeleton for the board view
export function BoardColumnSkeleton() {
  return (
    <div className="h-full w-[300px] flex-shrink-0">
      <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border bg-card/30 shadow-sm">
        {/* Column header */}
        <div className="flex items-center justify-between border-b bg-card/50 p-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
            <Ellipsis className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex flex-col space-y-3 p-2">
            <ImprovedCardSkeleton />
            <ImprovedCardSkeleton />
          </div>
        </div>

        {/* Add card button */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            disabled
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Add card</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Comprehensive Kanban board loading skeleton
export function BoardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col">
      {/* Board Toolbar (matching BoardToolbar component) */}
      <div className="flex w-full border-y px-4 py-3 sm:px-6">
        <div className="flex w-full flex-wrap items-center justify-between">
          {/* Mobile filters */}
          <div className="flex items-center gap-2 sm:hidden">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
              disabled
            >
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Filters</span>
            </Button>
          </div>

          {/* Desktop filters */}
          <div className="hidden grow sm:block">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-44 rounded-md" />
              <Skeleton className="h-9 w-44 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Column List */}
      <main className="relative flex-1 overflow-auto px-4 pb-6 pt-3 sm:px-6">
        <div className="flex w-fit items-start gap-5">
          {/* Columns */}
          {[1, 2, 3].map((i) => (
            <BoardColumnSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}

// Simple board card skeleton for list views
export function BoardCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-primary/10" />

        <div className="p-6 pt-8">
          {/* Title and icon */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="mt-1.5 h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>

          {/* Progress bar */}
          <div className="mb-6 space-y-1.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/40 p-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="mt-1 h-3 w-14" />
            </div>

            <div className="rounded-lg bg-muted/40 p-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="mt-1 h-3 w-10" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 p-3">
          <div className="flex w-full items-center justify-end">
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Board list skeleton
export function BoardListSkeleton() {
  return (
    <div className="flex max-w-xl flex-col gap-2">
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
  );
}

// Improved card skeleton that better matches CardBase/CardItem
function ImprovedCardSkeleton() {
  return (
    <div className="group relative flex flex-col gap-3 rounded-lg border border-l-4 bg-card/50 p-4 shadow-sm">
      {/* Header area with metadata */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      {/* Title and description */}
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <div className="prose prose-sm prose-invert line-clamp-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>

      {/* Footer area with labels, priority, and assignee */}
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
  );
}
