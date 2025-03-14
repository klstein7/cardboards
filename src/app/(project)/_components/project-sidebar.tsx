"use client";

import { ChartArea, Kanban, Plus, Settings, Star } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useBoards } from "~/lib/hooks";
import { cn } from "~/lib/utils";

import { CreateBoardDialog } from "./create-board-dialog";
import { ProjectSidebarSkeleton } from "./project-sidebar-skeleton";

const ThemeToggle = dynamic(
  () => import("./theme-toggle").then((mod) => mod.ThemeToggle),
  {
    ssr: false,
  },
);

interface ProjectSidebarProps {
  projectId: string;
}

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  {
    ssr: false,
    loading: () => <div className="h-8 w-8 rounded-full bg-muted" />,
  },
);

export function ProjectSidebar({ projectId }: ProjectSidebarProps) {
  const pathname = usePathname();
  const boards = useBoards(projectId);

  const isActivePathOrSubPath = (path: string) => pathname.startsWith(path);

  const isActiveBoardPath = (boardId: string) =>
    pathname === `/p/${projectId}/b/${boardId}`;

  if (boards.isError) {
    return <div>Error: {boards.error.message}</div>;
  }

  if (boards.isPending) return <ProjectSidebarSkeleton />;

  return (
    <div className="relative h-full">
      <TooltipProvider>
        <aside className="fixed left-0 top-0 z-10 hidden h-full w-[60px] border-r bg-background sm:block">
          <div className="flex h-full flex-col py-6">
            {/* Logo */}
            <div className="mb-8 flex items-center justify-center px-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Star className="h-6 w-6 flex-shrink-0 fill-yellow-300 stroke-foreground text-yellow-300 dark:stroke-none" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Starboard</TooltipContent>
              </Tooltip>
            </div>

            {/* Main Navigation */}
            <div className="space-y-1 px-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/p/${projectId}/overview/boards`}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "h-10 w-full justify-center px-0",
                        pathname === `/p/${projectId}/overview/boards` &&
                          "bg-muted/75",
                      )}
                    >
                      <Kanban className="h-5 w-5 flex-shrink-0" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Dashboard</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/p/${projectId}/analytics/overview`}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "h-10 w-full justify-center px-0",
                        isActivePathOrSubPath(
                          `/p/${projectId}/analytics/overview`,
                        ) && "bg-muted/75",
                      )}
                    >
                      <ChartArea className="h-5 w-5 flex-shrink-0" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Analytics</TooltipContent>
              </Tooltip>
            </div>

            {/* Boards Section */}
            <div className="mt-8 px-3">
              <div className="max-h-[40vh] space-y-1 overflow-hidden">
                {boards.data.map((board) => (
                  <Tooltip key={board.id}>
                    <TooltipTrigger asChild>
                      <Link href={`/p/${projectId}/b/${board.id}`}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "flex h-9 w-full items-center justify-center px-0",
                            isActiveBoardPath(board.id) && "bg-muted/75",
                          )}
                        >
                          <div
                            className="h-4 w-4 flex-shrink-0 rounded-full"
                            style={{ backgroundColor: board.color }}
                          />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{board.name}</TooltipContent>
                  </Tooltip>
                ))}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <CreateBoardDialog
                        trigger={
                          <Button
                            variant="ghost"
                            className="flex h-9 w-full items-center justify-center px-0 text-muted-foreground"
                          >
                            <Plus className="h-4 w-4 flex-shrink-0" />
                          </Button>
                        }
                        projectId={projectId}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">Add Board</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto space-y-2 px-3">
              <ThemeToggle isHovered={false} />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/p/${projectId}/settings`}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "h-10 w-full justify-center px-0",
                        isActivePathOrSubPath(`/p/${projectId}/settings`) &&
                          "bg-muted/75",
                      )}
                    >
                      <Settings className="h-5 w-5 flex-shrink-0" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>

              <div className="flex items-center justify-center py-2">
                <UserButton />
              </div>
            </div>
          </div>
        </aside>
      </TooltipProvider>
      {/* This is a placeholder div to take up the same space as the sidebar */}
      <div
        className="pointer-events-none fixed left-0 h-full w-[60px]"
        aria-hidden="true"
      />
    </div>
  );
}
