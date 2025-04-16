"use client";

import { ChevronDown, Folder, FolderKanban } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useProjects } from "~/lib/hooks/project/use-projects";
import { cn } from "~/lib/utils";

interface ProjectSelectorProps {
  projectId?: string;
  label: string;
  className?: string;
}

export function ProjectSelector({
  projectId,
  label,
  className,
}: ProjectSelectorProps) {
  const router = useRouter();
  const { data: projects } = useProjects();

  if (!projects || projects.length === 0) {
    return (
      <div className="flex items-center gap-1.5">
        <FolderKanban className="h-4 w-4 text-muted-foreground" />
        <span className={cn("text-sm", className)}>{label}</span>
      </div>
    );
  }

  // Sort projects alphabetically
  const sortedProjects = [...projects].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
        <div className="flex items-center">
          <FolderKanban className="mr-1.5 h-4 w-4 text-muted-foreground" />
          <span className={cn("text-sm font-medium", className)}>{label}</span>
          <ChevronDown className="ml-1 h-3 w-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {sortedProjects.map((project) => {
          const isActive = project.id === projectId;
          return (
            <DropdownMenuItem
              key={project.id}
              onClick={() => {
                if (!isActive) {
                  router.push(`/p/${project.id}`);
                }
              }}
              disabled={isActive}
              className={cn("flex gap-2 py-1.5", isActive && "font-medium")}
            >
              <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{project.name}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
