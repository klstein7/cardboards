import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Skeleton } from "~/components/ui/skeleton";

import BoardPageSkeleton from "./b/[boardId]/loading";

export default function BoardLayoutSkeleton() {
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
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>

          {/* Desktop filters */}
          <div className="hidden grow sm:block">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 w-[180px] rounded-md" />
              <Skeleton className="h-10 w-[180px] rounded-md" />
            </div>
          </div>

          {/* Generate button for desktop */}
          <div className="ml-auto hidden sm:block">
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </div>

      {/* Main content - Column List */}
      <main className="flex-1 overflow-hidden">
        <div className="scrollbar-thumb-rounded-full h-full w-full overflow-y-auto scrollbar-thin scrollbar-track-transparent">
          <div className="flex w-fit items-start gap-5 p-5">
            {/* Just show a basic loading placeholder - the real BoardPageSkeleton will replace it */}
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </main>
    </div>
  );
}
