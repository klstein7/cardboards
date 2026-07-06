"use client";

import {
  ChevronDown,
  Filter,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useState } from "react";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useBoardSafe, useStrictCurrentProjectId } from "~/lib/hooks";
import { useIsAdmin } from "~/lib/hooks/project-user/use-is-admin";

import { BoardFilters } from "./board-filters";
import { CreateColumnDialog } from "./create-column-dialog";
import { DeleteBoardDialog } from "./delete-board-dialog";
import { EditBoardDialog } from "./edit-board-dialog";
import { FilterIndicator } from "./filter-indicator";

interface BoardToolbarProps {
  boardId: string;
}

export function BoardToolbar({ boardId }: BoardToolbarProps) {
  const projectId = useStrictCurrentProjectId();
  const { data: board } = useBoardSafe(boardId);
  const isAdmin = useIsAdmin();
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [createColumnOpen, setCreateColumnOpen] = useState(false);
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false);

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

  const boardSettingsButton = (
    <Button
      variant="outline"
      size="sm"
      className="h-9 shrink-0 gap-1.5 px-3"
      disabled={!isAdmin}
      aria-label="Board settings"
    >
      <SlidersHorizontal className="h-4 w-4" />
      <span className="hidden sm:inline">Board settings</span>
      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
    </Button>
  );

  const boardActions = isAdmin ? (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{boardSettingsButton}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="px-2 py-1 text-xs font-medium text-muted-foreground">
            Board settings
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!board}
            onSelect={() => setEditBoardOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            <span>Edit board</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setCreateColumnOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>New column</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!board}
            onSelect={() => setDeleteBoardOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete board</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {board && (
        <EditBoardDialog
          board={board}
          open={editBoardOpen}
          onOpenChange={setEditBoardOpen}
        />
      )}
      <CreateColumnDialog
        boardId={boardId}
        trigger={null}
        open={createColumnOpen}
        onOpenChange={setCreateColumnOpen}
      />
      {board && (
        <DeleteBoardDialog
          board={board}
          open={deleteBoardOpen}
          onOpenChange={setDeleteBoardOpen}
        />
      )}
    </>
  ) : (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>{boardSettingsButton}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Only admins can manage board settings</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <BaseToolbar
      left={
        <>
          <div className="shrink-0">{boardContext}</div>
          {mobileFilters}
          {desktopFilters}
        </>
      }
      right={boardActions}
      className="flex-wrap"
    />
  );
}
