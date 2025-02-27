"use client";

import { Filter } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";

import { BoardFilters } from "./board-filters";
import { FilterIndicator } from "./filter-indicator";
import { GenerateDropdownMenu } from "./generate-dropdown-menu";

interface BoardToolbarProps {
  boardId: string;
}

export function BoardToolbar({ boardId }: BoardToolbarProps) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      {/* Mobile view */}
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

        <GenerateDropdownMenu boardId={boardId} />
      </div>

      {/* Desktop view */}
      <div className="hidden grow sm:block">
        <BoardFilters />
      </div>

      <div className="ml-auto hidden sm:block">
        <GenerateDropdownMenu boardId={boardId} />
      </div>
    </div>
  );
}
