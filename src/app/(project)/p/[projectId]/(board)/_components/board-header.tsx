"use client";

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

interface BoardHeaderProps {
  projectId: string;
  projectName: string;
  boardName: string;
  boardColor: string;
}

export function BoardHeader({
  projectId,
  projectName,
  boardName,
  boardColor,
}: BoardHeaderProps) {
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
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: boardColor }}
              />
              <span className="font-semibold">{boardName}</span>
            </div>
          </BreadcrumbItem>
        </BreadcrumbList>
      </div>
    </div>
  );
}
