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
    <div className="flex flex-wrap items-center justify-between gap-1 px-2 py-1.5">
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <BreadcrumbList className="flex-wrap">
          {items.map((item, index) => (
            <React.Fragment key={`breadcrumb-${index}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className="max-w-[50vw]">
                {item.href ? (
                  <BreadcrumbLink href={item.href} className="truncate text-sm">
                    {item.label}
                  </BreadcrumbLink>
                ) : (
                  <div className="flex items-center gap-1">
                    {item.color && (
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    {item.icon}
                    <span className="truncate text-sm font-semibold">
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
        <div className="flex flex-shrink-0 items-center gap-1">{actions}</div>
      )}
    </div>
  );
}
