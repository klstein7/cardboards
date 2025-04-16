"use client";

import React from "react";

import { BoardSelector } from "~/components/shared/board-selector";
// Custom components and hooks
import { ProjectSelector } from "~/components/shared/project-selector";
// UI components
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { useIsMobile } from "~/lib/hooks/utils";

interface BreadcrumbItemProps {
  href?: string;
  icon?: React.ReactNode;
  label: string;
  color?: string;
  isProject?: boolean;
  projectId?: string;
  isBoard?: boolean;
  boardId?: string;
}

interface BaseHeaderProps {
  items: BreadcrumbItemProps[];
  actions?: React.ReactNode;
}

export function BaseHeader({ items, actions }: BaseHeaderProps) {
  const isMobile = useIsMobile();

  // On mobile, only show a limited number of breadcrumb items
  const visibleItems =
    isMobile && items.length > 2
      ? [items[0], ...items.slice(-1)] // Show first and last item on very small screens
      : items;

  return (
    <div className="flex h-full flex-wrap items-center justify-between gap-1 px-1 py-1 sm:px-2">
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
        <BreadcrumbList className="flex-wrap">
          {visibleItems.map((item, index) => (
            <React.Fragment key={`breadcrumb-${index}`}>
              {index > 0 && (
                <>
                  {isMobile &&
                  items.length > 2 &&
                  index === 1 &&
                  items.length > 2 ? (
                    <div className="mx-1 flex items-center text-muted-foreground">
                      <span className="text-xs">...</span>
                    </div>
                  ) : (
                    <BreadcrumbSeparator />
                  )}
                </>
              )}
              <BreadcrumbItem className="max-w-[40vw] sm:max-w-[50vw]">
                {item?.href && !item.isProject && !item.isBoard ? (
                  <BreadcrumbLink
                    href={item.href}
                    className="truncate whitespace-nowrap text-sm"
                  >
                    {item.label}
                  </BreadcrumbLink>
                ) : item?.isProject ? (
                  <ProjectSelector
                    projectId={item.projectId}
                    label={item.label}
                  />
                ) : item?.isBoard && item.projectId ? (
                  <BoardSelector
                    projectId={item.projectId}
                    boardId={item.boardId}
                    label={item.label}
                  />
                ) : (
                  <div className="flex items-center gap-1">
                    {item?.color && (
                      <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    {item?.icon}
                    <span className="truncate whitespace-nowrap text-sm font-semibold">
                      {item?.label}
                    </span>
                  </div>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </div>
      {actions && (
        <div className="flex flex-shrink-0 items-center gap-1">{actions}</div>
      )}
    </div>
  );
}
