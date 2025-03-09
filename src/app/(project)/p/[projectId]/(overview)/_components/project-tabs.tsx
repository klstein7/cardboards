"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";

import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface ProjectTabsListProps {
  projectId: string;
  children: ReactNode;
}

export function ProjectTabs({ projectId, children }: ProjectTabsListProps) {
  const router = useRouter();
  const pathname = usePathname();

  const value = pathname.split("/").pop();

  return (
    <Tabs value={value} className="w-full">
      <TabsList className="mb-4 w-full max-w-md">
        <TabsTrigger
          value="boards"
          className="flex-1"
          onClick={() =>
            router.push(`/p/${projectId}/boards`, { scroll: false })
          }
        >
          Boards
        </TabsTrigger>
        <TabsTrigger
          value="activity"
          className="flex-1"
          onClick={() =>
            router.push(`/p/${projectId}/activity`, { scroll: false })
          }
        >
          Activity
        </TabsTrigger>
        <TabsTrigger
          value="members"
          className="flex-1"
          onClick={() =>
            router.push(`/p/${projectId}/members`, { scroll: false })
          }
        >
          Members
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
