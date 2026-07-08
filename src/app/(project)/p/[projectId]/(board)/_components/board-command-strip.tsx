"use client";

import { Bell, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

import { Notifications } from "~/app/(project)/_components/notifications";
import { BrandIcon } from "~/components/brand/brand-icon";
import { BoardSelector } from "~/components/shared/board-selector";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  useBoardSafe,
  useCachedCardsByCurrentBoard,
  useColumns,
  useProject,
  useProjectUsers,
  useStrictCurrentProjectId,
} from "~/lib/hooks";
import { useNotificationUnreadCount } from "~/lib/hooks/notification";
import { cn } from "~/lib/utils";

import { BoardLabelFilter } from "./board-filters";
import { BoardSettingsMenu } from "./board-settings-menu";
import { CreateCardDialog } from "./create-card-dialog";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  {
    ssr: false,
    loading: () => (
      <div className="h-7 w-7 rounded-full border border-border bg-muted" />
    ),
  },
);

interface BoardCommandStripProps {
  boardId: string;
}

export function BoardCommandStrip({ boardId }: BoardCommandStripProps) {
  const projectId = useStrictCurrentProjectId();
  const { data: board } = useBoardSafe(boardId);
  const { data: project } = useProject(projectId);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { data: unreadCount = 0 } = useNotificationUnreadCount();

  const cards = useCachedCardsByCurrentBoard();
  const columns = useColumns(boardId);
  const projectUsers = useProjectUsers(projectId);
  const [assignedTo, setAssignedTo] = useQueryState(
    "assignedTo",
    parseAsArrayOf(parseAsString),
  );

  const completedColumnIds = new Set(
    (columns.data ?? [])
      .filter((column) => column.isCompleted)
      .map((column) => column.id),
  );
  const doneCount = cards.filter((card) =>
    completedColumnIds.has(card.columnId),
  ).length;
  const donePercent =
    cards.length > 0 ? Math.round((doneCount / cards.length) * 100) : 0;

  const firstOpenColumn = [...(columns.data ?? [])]
    .filter((column) => !column.isCompleted)
    .sort((a, b) => a.order - b.order)[0];

  const memberList = projectUsers.data ?? [];
  const visibleMembers = memberList.slice(0, 5);
  const extraMembers = memberList.length - visibleMembers.length;

  const toggleAssignee = (projectUserId: string) => {
    if (assignedTo?.includes(projectUserId)) {
      const remaining = assignedTo.filter((id) => id !== projectUserId);
      void setAssignedTo(remaining.length > 0 ? remaining : null);
    } else {
      void setAssignedTo([...(assignedTo ?? []), projectUserId]);
    }
  };

  return (
    <div className="flex h-12 w-full items-stretch">
      <Link
        href="/projects"
        aria-label="All projects"
        className="flex shrink-0 items-center border-r border-border px-3.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <BrandIcon variant="xsmall" />
      </Link>

      <div className="flex min-w-0 items-center gap-2 border-r border-border px-4">
        {project && (
          <>
            <Link
              href={`/p/${projectId}/overview/boards`}
              className="min-w-0 max-w-32 truncate text-sm text-muted-foreground transition-colors hover:text-foreground sm:max-w-52"
            >
              {project.name}
            </Link>
            <span className="shrink-0 text-border">/</span>
          </>
        )}
        <BoardSelector
          projectId={projectId}
          boardId={boardId}
          label={board?.name ?? "Board"}
          compact
        />
        <BoardSettingsMenu boardId={boardId} />
      </div>

      <div className="hidden items-center gap-4 whitespace-nowrap px-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:flex">
        <span>
          {cards.length} {cards.length === 1 ? "card" : "cards"}
        </span>
        <span>{doneCount} done</span>
        <span className="text-primary">{donePercent}%</span>
      </div>

      <div className="min-w-0 flex-1" />

      <div className="hidden max-w-md items-center overflow-x-auto px-4 scrollbar-none md:flex">
        <BoardLabelFilter className="flex-nowrap" />
      </div>

      {memberList.length > 0 && (
        <div className="hidden items-center border-l border-border px-4 md:flex">
          <div className="flex -space-x-1.5">
            {visibleMembers.map((projectUser) => {
              const isActive = assignedTo?.includes(projectUser.id) ?? false;
              return (
                <button
                  key={projectUser.id}
                  onClick={() => toggleAssignee(projectUser.id)}
                  aria-pressed={isActive}
                  aria-label={`Filter by ${projectUser.user.name}`}
                  className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <Avatar
                    title={projectUser.user.name}
                    className={cn(
                      "h-6 w-6 ring-2 ring-background",
                      isActive && "ring-primary",
                    )}
                  >
                    <AvatarImage src={projectUser.user.imageUrl ?? undefined} />
                    <AvatarFallback className="text-[9px]">
                      {projectUser.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              );
            })}
          </div>
          {extraMembers > 0 && (
            <span className="ml-2 font-mono text-[10px] text-muted-foreground">
              +{extraMembers}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center border-l border-border">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-full w-12 text-muted-foreground hover:text-foreground"
          onClick={() => setNotificationsOpen(true)}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </div>

      {firstOpenColumn && (
        <div className="flex items-center border-l border-border px-3">
          <CreateCardDialog
            columnId={firstOpenColumn.id}
            trigger={
              <Button className="h-8 shrink-0 gap-1.5 bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New card</span>
              </Button>
            }
          />
        </div>
      )}

      <div className="flex items-center border-l border-border px-3">
        <UserButton afterSignOutUrl="/" />
      </div>

      <Notifications
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </div>
  );
}
