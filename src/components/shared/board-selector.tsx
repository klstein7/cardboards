"use client";

import { ChevronDown, Kanban } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
      <div className="flex items-center gap-1.5">
        <Kanban className="h-4 w-4 text-muted-foreground" />
        <span className={cn("text-sm", className)}>{label}</span>
      </div>
    );
  }

  // Sort boards alphabetically
  const sortedBoards = [...boards].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
        <div className="flex items-center">
          <Kanban
            className="mr-1.5 h-4 w-4 text-muted-foreground"
            style={
              boardId
                ? { color: boards.find((b) => b.id === boardId)?.color }
                : undefined
            }
          />
          <span className={cn("text-sm font-medium", className)}>{label}</span>
          <ChevronDown className="ml-1 h-3 w-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {sortedBoards.map((board) => {
          const isActive = board.id === boardId;
          return (
            <DropdownMenuItem
              key={board.id}
              onClick={() => {
                if (!isActive) {
                  router.push(`/p/${projectId}/b/${board.id}`);
                }
              }}
              disabled={isActive}
              className={cn("flex gap-2 py-1.5", isActive && "font-medium")}
            >
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: board.color }}
              />
              <span className="truncate">{board.name}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
