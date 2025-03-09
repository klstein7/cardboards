"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode } from "react";

import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface AnalyticsTabsProps {
  projectId: string;
  children: ReactNode;
}

export function AnalyticsTabs({ projectId, children }: AnalyticsTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const value = pathname.split("/").pop();

  return (
    <Tabs value={value} className="w-full space-y-4">
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
