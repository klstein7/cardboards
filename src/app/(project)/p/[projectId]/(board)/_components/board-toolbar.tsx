"use client";

import { Filter, Plus } from "lucide-react";

import { BoardSelector } from "~/components/shared/board-selector";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
  useBoardSafe,
  useCachedCardsByCurrentBoard,
  useColumns,
  useProjectUsers,
  useStrictCurrentProjectId,
} from "~/lib/hooks";

import { BoardFilters, BoardLabelFilter } from "./board-filters";
import { BoardSettingsMenu } from "./board-settings-menu";
import { CreateCardDialog } from "./create-card-dialog";
import { FilterIndicator } from "./filter-indicator";

interface BoardToolbarProps {
  boardId: string;
}

export function BoardToolbar({ boardId }: BoardToolbarProps) {
  const projectId = useStrictCurrentProjectId();
  const { data: board } = useBoardSafe(boardId);

  const cards = useCachedCardsByCurrentBoard();
  const columns = useColumns(boardId);
  const projectUsers = useProjectUsers(projectId);

  const completedColumnIds = new Set(
    (columns.data ?? [])
      .filter((column) => column.isCompleted)
      .map((column) => column.id),
  );
  const doneCount = cards.filter((card) =>
    completedColumnIds.has(card.columnId),
  ).length;

  const firstOpenColumn = [...(columns.data ?? [])]
    .filter((column) => !column.isCompleted)
    .sort((a, b) => a.order - b.order)[0];

  const memberList = projectUsers.data ?? [];
  const visibleMembers = memberList.slice(0, 5);
  const extraMembers = memberList.length - visibleMembers.length;

  const boardContext = (
    <div className="flex min-w-0 items-baseline gap-3">
      <BoardSelector
        projectId={projectId}
        boardId={boardId}
        label={board?.name ?? "Board"}
      />
      <span className="hidden shrink-0 font-mono text-xs text-muted-foreground md:inline">
        {cards.length} {cards.length === 1 ? "card" : "cards"} · {doneCount}{" "}
        done
      </span>
    </div>
  );

  const mobileFilters = (
    <div className="flex items-center gap-2 sm:hidden">
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Filter cards"
          >
            <Filter className="h-4 w-4" />
            <FilterIndicator className="absolute -right-1 -top-1" />
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

  const memberStack = memberList.length > 0 && (
    <div className="hidden items-center md:flex">
      <div className="flex -space-x-1.5">
        {visibleMembers.map((projectUser) => (
          <Avatar
            key={projectUser.id}
            title={projectUser.user.name}
            className="h-6 w-6 ring-2 ring-background"
          >
            <AvatarImage src={projectUser.user.imageUrl ?? undefined} />
            <AvatarFallback className="text-[9px]">
              {projectUser.user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {extraMembers > 0 && (
        <span className="ml-2 font-mono text-[10px] text-muted-foreground">
          +{extraMembers}
        </span>
      )}
    </div>
  );

  const newCardButton = firstOpenColumn && (
    <CreateCardDialog
      columnId={firstOpenColumn.id}
      trigger={
        <Button className="h-8 shrink-0 gap-1.5 px-3 text-sm font-medium">
          <Plus className="h-3.5 w-3.5" />
          <span>New card</span>
        </Button>
      }
    />
  );

  return (
    <div className="flex w-full flex-wrap items-center gap-x-6 gap-y-3">
      {boardContext}
      <BoardLabelFilter className="hidden min-w-0 md:flex" />
      <div className="ml-auto flex shrink-0 items-center gap-4">
        {mobileFilters}
        {memberStack}
        {newCardButton}
        <BoardSettingsMenu boardId={boardId} />
      </div>
    </div>
  );
}
