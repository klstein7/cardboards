import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export default function AnalyticsPageSkeleton() {
  return (
    <div className="flex h-[100dvh] w-full flex-col">
      {/* Analytics Header (matching AnalyticsHeader component) */}
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
            <Skeleton className="h-4 w-20" />
          </BreadcrumbItem>
        </BreadcrumbList>
      </div>

      {/* Analytics Toolbar (matching AnalyticsToolbar component) */}
      <div className="flex w-full border-b border-t px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col sm:flex-row sm:items-center sm:justify-between">
          {/* Filter Info */}
          <div className="mb-3 flex items-center gap-2 sm:mb-0">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-[130px] rounded-md" />
            <Skeleton className="h-9 w-[180px] rounded-md" />
            <Skeleton className="h-9 w-[100px] rounded-md" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto px-4 pb-6 sm:px-6 lg:px-8">
        <div className="py-4">
          {/* Summary Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm">
                <CardContent className="flex p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                  <div className="ml-4 flex flex-col justify-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="mt-1.5 h-6 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="rounded-md bg-card/50 p-1 backdrop-blur-sm">
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-24 rounded-sm" />
                  <Skeleton className="h-8 w-24 rounded-sm" />
                  <Skeleton className="h-8 w-24 rounded-sm" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="space-y-6">
              {/* Trend Chart */}
              <div className="rounded-md border bg-card p-4">
                <div className="mb-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="mt-1 h-4 w-64" />
                </div>
                <div className="aspect-[3/1] w-full">
                  <Skeleton className="h-full w-full" />
                </div>
              </div>

              {/* Due Date and Priority Charts */}
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-md border bg-card p-4">
                    <div className="mb-4">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="mt-1 h-4 w-64" />
                    </div>
                    <div className="aspect-square w-full">
                      <Skeleton className="h-full w-full rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
