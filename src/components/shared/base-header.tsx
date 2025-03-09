"use client";

import React from "react";

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

interface BreadcrumbItemProps {
  href?: string;
  icon?: React.ReactNode;
  label: string;
  color?: string;
}

interface BaseHeaderProps {
  items: BreadcrumbItemProps[];
  actions?: React.ReactNode;
}

export function BaseHeader({ items, actions }: BaseHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3 lg:px-6 lg:py-4">
      <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2 md:gap-4">
        <BreadcrumbList className="flex-wrap">
          {items.map((item, index) => (
            <React.Fragment key={`breadcrumb-${index}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className="max-w-[50vw] sm:max-w-none">
                {item.href ? (
                  <BreadcrumbLink
                    href={item.href}
                    className="truncate text-sm sm:text-base"
                  >
                    {item.label}
                  </BreadcrumbLink>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                    {item.color && (
                      <div
                        className="h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5 md:h-3 md:w-3"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    {item.icon}
                    <span className="truncate text-sm font-semibold sm:text-base">
                      {item.label}
                    </span>
                  </div>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </div>
      {actions && (
        <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
