"use client";

import { Filter } from "lucide-react";

import { BaseToolbar } from "~/components/shared/base-toolbar";
import { BoardSelector } from "~/components/shared/board-selector";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { useBoardSafe, useStrictCurrentProjectId } from "~/lib/hooks";

import { BoardFilters } from "./board-filters";
import { FilterIndicator } from "./filter-indicator";

interface BoardToolbarProps {
  boardId: string;
}

export function BoardToolbar({ boardId }: BoardToolbarProps) {
  const projectId = useStrictCurrentProjectId();
  const { data: board } = useBoardSafe(boardId);

  const boardContext = (
    <BoardSelector
      projectId={projectId}
      boardId={boardId}
      label={board?.name ?? "Board"}
      className="font-medium"
    />
  );

  const mobileFilters = (
    <div className="flex items-center gap-2 sm:hidden">
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            <FilterIndicator className="ml-1.5" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="px-4 pb-6">
          <DrawerHeader>
            <DrawerTitle>Filter Board</DrawerTitle>
            <DrawerDescription>
              Filter cards by label, assignee, or search.
            </DrawerDescription>
          </DrawerHeader>
          <BoardFilters />
        </DrawerContent>
      </Drawer>
    </div>
  );

  const desktopFilters = (
    <div className="hidden grow sm:block">
      <BoardFilters />
    </div>
  );

  return (
    <BaseToolbar
      left={
        <>
          <div className="shrink-0">{boardContext}</div>
          <div className="mx-1 hidden h-5 w-px bg-border sm:block" />
          {mobileFilters}
          {desktopFilters}
        </>
      }
      className="flex-wrap"
    />
  );
}
