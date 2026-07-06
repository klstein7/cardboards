"use client";

import { Check, ChevronDown, Folder, FolderKanban } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
      <div className="flex h-9 min-w-0 items-center gap-2 border border-border bg-muted/20 px-2.5">
        <FolderKanban className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className={cn("min-w-0 truncate text-sm font-medium", className)}>
          {label}
        </span>
      </div>
    );
  }

  // Sort projects alphabetically
  const sortedProjects = [...projects].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group flex h-9 min-w-0 max-w-full items-center gap-2 border border-border bg-muted/20 px-2.5 text-left transition-colors data-[state=open]:border-primary/70 data-[state=open]:bg-muted/60 hover:border-foreground/25 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label="Switch project"
      >
        <FolderKanban className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-data-[state=open]:text-primary" />
        <span
          className={cn("min-w-0 truncate text-sm font-semibold", className)}
        >
          {label}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 p-1.5">
        <DropdownMenuLabel className="px-2 py-1 text-xs font-medium text-muted-foreground">
          Switch project
        </DropdownMenuLabel>
        {sortedProjects.map((project) => {
          const isActive = project.id === projectId;
          return (
            <DropdownMenuItem
              key={project.id}
              onSelect={() => {
                if (!isActive) {
                  router.push(`/p/${project.id}`);
                }
              }}
              className={cn(
                "flex min-w-0 gap-2.5 px-2 py-2",
                isActive && "bg-accent font-medium text-accent-foreground",
              )}
            >
              <Folder
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground",
                  isActive && "text-primary",
                )}
              />
              <span className="min-w-0 flex-1 truncate">{project.name}</span>
              {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
