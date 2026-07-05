"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode } from "react";

import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";

interface ProjectTabsListProps {
  projectId: string;
  children: ReactNode;
  className?: string;
}

export function ProjectTabs({
  projectId,
  children,
  className,
}: ProjectTabsListProps) {
  const router = useRouter();
  const pathname = usePathname();

  const value = pathname.split("/").pop();

  return (
    <Tabs value={value} className={cn("w-full space-y-4", className)}>
      <TabsList className="mb-4 w-full">
        <TabsTrigger
          value="boards"
          onClick={() =>
            router.push(`/p/${projectId}/overview/boards`, { scroll: false })
          }
        >
          Boards
        </TabsTrigger>
        <TabsTrigger
          value="activity"
          onClick={() =>
            router.push(`/p/${projectId}/overview/activity`, { scroll: false })
          }
        >
          Activity
        </TabsTrigger>
        <TabsTrigger
          value="members"
          onClick={() =>
            router.push(`/p/${projectId}/overview/members`, { scroll: false })
          }
        >
          Members
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
