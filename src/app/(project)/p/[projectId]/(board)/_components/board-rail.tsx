"use client";

import { Plus } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

import { BoardSelector } from "~/components/shared/board-selector";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  useBoardSafe,
  useCachedCardsByCurrentBoard,
  useColumns,
  useProjectUsers,
  useStrictCurrentProjectId,
} from "~/lib/hooks";
import { cn } from "~/lib/utils";

import { BoardLabelFilter, BoardSearch } from "./board-filters";
import { BoardSettingsMenu } from "./board-settings-menu";
import { RAIL_PALETTE } from "./column-item";
import { CreateCardDialog } from "./create-card-dialog";

interface BoardRailProps {
  boardId: string;
}

export function BoardRail({ boardId }: BoardRailProps) {
  const projectId = useStrictCurrentProjectId();
  const { data: board } = useBoardSafe(boardId);
  const columns = useColumns(boardId);
  const cards = useCachedCardsByCurrentBoard();
  const projectUsers = useProjectUsers(projectId);
  const [assignedTo, setAssignedTo] = useQueryState(
    "assignedTo",
    parseAsArrayOf(parseAsString),
  );

  const sortedColumns = [...(columns.data ?? [])].sort(
    (a, b) => a.order - b.order,
  );
  const completedColumnIds = new Set(
    sortedColumns.filter((column) => column.isCompleted).map((c) => c.id),
  );
  const doneCount = cards.filter((card) =>
    completedColumnIds.has(card.columnId),
  ).length;
  const firstOpenColumn = sortedColumns.find((column) => !column.isCompleted);
  const memberList = projectUsers.data ?? [];

  const scrollToColumn = (columnId: string) => {
    document.getElementById(`board-column-${columnId}`)?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const toggleAssignee = (projectUserId: string) => {
    if (assignedTo?.includes(projectUserId)) {
      const remaining = assignedTo.filter((id) => id !== projectUserId);
      void setAssignedTo(remaining.length > 0 ? remaining : null);
    } else {
      void setAssignedTo([...(assignedTo ?? []), projectUserId]);
    }
  };

  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-r border-border lg:flex">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-5 pb-5 pt-6">
          <div className="flex items-center justify-between gap-2">
            <BoardSelector
              projectId={projectId}
              boardId={boardId}
              label={board?.name ?? "Board"}
            />
            <BoardSettingsMenu boardId={boardId} />
          </div>
          <p className="mt-1.5 font-mono text-xs text-muted-foreground">
            {cards.length} {cards.length === 1 ? "card" : "cards"} ·{" "}
            {doneCount} done
          </p>
        </div>

        <div className="border-t border-border px-5 py-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Stages
          </p>
          <div className="mt-3 flex flex-col gap-2.5">
            {sortedColumns.map((column) => {
              const count = cards.filter(
                (card) => card.columnId === column.id,
              ).length;
              return (
                <button
                  key={column.id}
                  onClick={() => scrollToColumn(column.id)}
                  className="group flex w-full items-center gap-2.5 text-left"
                >
                  <span
                    className="h-3.5 w-0.5 shrink-0"
                    style={{
                      backgroundColor:
                        RAIL_PALETTE[column.order % RAIL_PALETTE.length],
                    }}
                  />
                  <span
                    className={cn(
                      "truncate text-sm text-muted-foreground transition-colors group-hover:text-foreground",
                      column.isCompleted &&
                        "text-primary group-hover:text-primary",
                    )}
                  >
                    {column.name}
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border px-5 py-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Filters
          </p>
          <BoardSearch className="mt-3" />
          <BoardLabelFilter className="mt-3" />
        </div>

        {memberList.length > 0 && (
          <div className="border-t border-border px-5 py-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Members
            </p>
            <div className="mt-3 flex flex-col gap-2.5">
              {memberList.map((projectUser) => {
                const isActive = assignedTo?.includes(projectUser.id) ?? false;
                return (
                  <button
                    key={projectUser.id}
                    onClick={() => toggleAssignee(projectUser.id)}
                    className="group flex w-full items-center gap-2.5 text-left"
                    aria-pressed={isActive}
                  >
                    <Avatar
                      className={cn(
                        "h-6 w-6",
                        isActive && "ring-1 ring-primary",
                      )}
                    >
                      <AvatarImage
                        src={projectUser.user.imageUrl ?? undefined}
                      />
                      <AvatarFallback className="text-[9px]">
                        {projectUser.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "truncate text-sm text-muted-foreground transition-colors group-hover:text-foreground",
                        isActive && "text-primary group-hover:text-primary",
                      )}
                    >
                      {projectUser.user.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {firstOpenColumn && (
        <div className="border-t border-border p-5">
          <CreateCardDialog
            columnId={firstOpenColumn.id}
            trigger={
              <Button className="h-8 w-full gap-1.5 text-sm font-medium">
                <Plus className="h-3.5 w-3.5" />
                <span>New card</span>
              </Button>
            }
          />
        </div>
      )}
    </aside>
  );
}
