"use client";

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

interface AnalyticsHeaderProps {
  projectId: string;
  projectName: string;
}

export function AnalyticsHeader({
  projectId,
  projectName,
}: AnalyticsHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/p/${projectId}`}>
              {projectName}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Analytics</span>
            </div>
          </BreadcrumbItem>
        </BreadcrumbList>
      </div>
    </div>
  );
}
