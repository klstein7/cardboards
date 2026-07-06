"use client";

import { Check, ChevronDown, Kanban } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useBoards } from "~/lib/hooks";
import { cn } from "~/lib/utils";

interface BoardSelectorProps {
  projectId: string;
  boardId?: string;
  label: string;
  className?: string;
}

export function BoardSelector({
  projectId,
  boardId,
  label,
  className,
}: BoardSelectorProps) {
  const router = useRouter();
  const { data: boards } = useBoards(projectId);

  if (!boards || boards.length === 0) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "min-w-0 truncate text-2xl font-light tracking-tight",
            className,
          )}
        >
          {label}
        </span>
      </div>
    );
  }

  // Sort boards alphabetically
  const sortedBoards = [...boards].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group flex min-w-0 max-w-full items-center gap-2 text-left transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[state=open]:text-primary"
        aria-label="Switch board"
      >
        <span
          className={cn(
            "min-w-0 truncate text-2xl font-light tracking-tight",
            className,
          )}
        >
          {label}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 p-1.5">
        <DropdownMenuLabel className="px-2 py-1 text-xs font-medium text-muted-foreground">
          Switch board
        </DropdownMenuLabel>
        {sortedBoards.map((board) => {
          const isActive = board.id === boardId;
          return (
            <DropdownMenuItem
              key={board.id}
              onSelect={() => {
                if (!isActive) {
                  router.push(`/p/${projectId}/b/${board.id}`);
                }
              }}
              className={cn(
                "flex min-w-0 gap-2.5 px-2 py-2",
                isActive && "bg-accent font-medium text-accent-foreground",
              )}
            >
              <Kanban
                className="h-4 w-4 shrink-0 text-muted-foreground"
                style={{ color: board.color }}
              />
              <span className="min-w-0 flex-1 truncate">{board.name}</span>
              {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
