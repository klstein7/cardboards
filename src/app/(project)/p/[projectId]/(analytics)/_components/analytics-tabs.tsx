"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode } from "react";

import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
interface AnalyticsTabsProps {
  projectId: string;
  children: ReactNode;
  className?: string;
}

export function AnalyticsTabs({
  projectId,
  children,
  className,
}: AnalyticsTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const value = pathname.split("/").pop();

  return (
    <Tabs value={value} className={cn("w-full space-y-4", className)}>
      <TabsList className="mb-4 w-full max-w-md">
        <TabsTrigger
          value="overview"
          className="flex-1"
          onClick={() =>
            router.push(`/p/${projectId}/analytics/overview`, { scroll: false })
          }
        >
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="progress"
          className="flex-1"
          onClick={() =>
            router.push(`/p/${projectId}/analytics/progress`, { scroll: false })
          }
        >
          Progress
        </TabsTrigger>
        <TabsTrigger
          value="activity"
          className="flex-1"
          onClick={() =>
            router.push(`/p/${projectId}/analytics/activity`, { scroll: false })
          }
        >
          Activity
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
