import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export default function ProjectPageSkeleton() {
  return (
    <div className="flex h-[100dvh] w-full flex-col">
      {/* Project Header (matching ProjectHeader component) */}
      <div className="border-b px-4 py-4 sm:px-6 lg:px-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <Skeleton className="h-4 w-32" />
          </BreadcrumbItem>
        </BreadcrumbList>
      </div>

      {/* Project Toolbar (matching ProjectToolbar component) */}
      <div className="flex w-full border-b border-t px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </div>

      {/* Main content area */}
      <main className="flex-1 overflow-auto px-4 pb-6 sm:px-6 lg:px-8">
        {/* Project Stats */}
        <div className="py-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="border-border/80 bg-secondary/20 shadow-lg"
              >
                <div className="relative flex items-center gap-4 p-6">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="mt-6">
          {/* Tabs */}
          <div className="mb-4">
            <div className="flex w-full max-w-md">
              <Skeleton className="h-10 w-full max-w-[133px] rounded-md" />
              <Skeleton className="h-10 w-full max-w-[133px] rounded-md" />
              <Skeleton className="h-10 w-full max-w-[133px] rounded-md" />
            </div>
          </div>

          {/* Board list content */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b p-4 sm:p-6">
              <div>
                <Skeleton className="h-7 w-40" />
                <Skeleton className="mt-1 h-4 w-64" />
              </div>
            </div>

            <div className="p-4 pt-5 sm:p-6">
              {/* Search and filters */}
              <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
                <Skeleton className="h-10 w-full max-w-[300px]" />
                <Skeleton className="h-10 w-[180px]" />
                <Skeleton className="h-10 w-20" />
              </div>

              {/* Board grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
