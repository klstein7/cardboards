"use client";

import { usePathname } from "next/navigation";
import React from "react";

import { ProjectNavbar } from "./project-navbar";
import { ProjectRealtimeProvider } from "./project-realtime-provider";

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
  const pathname = usePathname();
  // Board pages carry their own full-width command strip, so the app
  // navbar only renders on the overview and settings surfaces.
  const isBoardPage = pathname.includes(`/p/${projectId}/b/`);

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden">
      {!isBoardPage && (
        <ProjectNavbar projectId={projectId} projectName={project.name} />
      )}
      <div className="min-h-0 flex-1 overflow-hidden">
        <ProjectRealtimeProvider>{children}</ProjectRealtimeProvider>
      </div>
    </div>
  );
}
