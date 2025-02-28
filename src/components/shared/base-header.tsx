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
    <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <BreadcrumbList>
          {items.map((item, index) => (
            <React.Fragment key={`breadcrumb-${index}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                ) : (
                  <div className="flex items-center gap-2">
                    {item.color && (
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    {item.icon}
                    <span className="font-semibold">{item.label}</span>
                  </div>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
