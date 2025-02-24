import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Skeleton } from "~/components/ui/skeleton";

export default function ProjectPageSkeleton() {
  return (
    <div className="flex h-[100dvh] w-full">
      <div className="flex w-full max-w-7xl flex-col gap-6 px-6 pt-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <Skeleton className="h-4 w-32" />
          </BreadcrumbItem>
        </BreadcrumbList>

        <div className="flex justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-28" />
        </div>

        {/* Project Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>

        {/* Board List */}
        <div className="mt-6">
          <Skeleton className="mb-6 h-7 w-24" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
