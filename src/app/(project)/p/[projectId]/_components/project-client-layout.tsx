"use client";

import React, { useState } from "react";

import { cn } from "~/lib/utils";

import { DynamicHeader } from "../../../_components/dynamic-header";
import { MobileNav } from "../../../_components/mobile-nav";
import { ProjectSidebar } from "../../../_components/project-sidebar";

interface ProjectClientLayoutProps {
  children: React.ReactNode;
  projectId: string;
  project: { name: string };
}

export function ProjectClientLayout({
  children,
  projectId,
  project,
}: ProjectClientLayoutProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div
      className="flex h-[100dvh] w-full overflow-hidden"
      style={{ "--header-height": "40px" } as React.CSSProperties}
    >
      <ProjectSidebar
        projectId={projectId}
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
      />

      <div
        className={cn(
          "h-full flex-1 overflow-hidden transition-all duration-500 ease-in-out",
          isSidebarExpanded ? "sm:ml-[240px]" : "sm:ml-[60px]",
        )}
      >
        <div className="sticky top-0 z-10 w-full bg-background shadow-sm">
          <DynamicHeader projectId={projectId} projectName={project.name} />
        </div>
        <MobileNav projectId={projectId} />
        <div className="h-[calc(100%-var(--header-height))] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
