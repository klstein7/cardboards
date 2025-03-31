"use client";

import {
  ChartArea,
  ChevronLeft,
  ChevronRight,
  Kanban,
  Palette,
  Plus,
  Settings,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Nunito } from "next/font/google";
import Image from "next/image";
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
import { useIsAdmin } from "~/lib/hooks/project-user/use-is-admin";
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
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
}

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  {
    ssr: false,
    loading: () => <div className="h-8 w-8 rounded-full bg-muted" />,
  },
);

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900", "1000"],
});

export function ProjectSidebar({
  projectId,
  isExpanded,
  setIsExpanded,
}: ProjectSidebarProps) {
  const pathname = usePathname();
  const boards = useBoards(projectId);
  const isAdmin = useIsAdmin();

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
        <aside
          className={cn(
            "fixed left-0 top-0 z-10 hidden h-full border-r bg-background transition-all duration-500 ease-in-out sm:block",
            isExpanded ? "w-[240px]" : "w-[60px]",
          )}
        >
          <div className="absolute right-0 top-[4.25rem] z-20 -translate-y-1/2 translate-x-1/2">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 rounded-full border bg-background shadow-md"
                >
                  {isExpanded ? (
                    <ChevronLeft className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isExpanded ? "Collapse" : "Expand"}
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex h-full flex-col bg-accent-foreground py-6">
            {/* Logo */}
            <div
              className={cn(
                "mb-8 flex items-center",
                isExpanded ? "justify-start gap-2 px-3" : "justify-center px-4",
              )}
            >
              <Tooltip disableHoverableContent={isExpanded}>
                <TooltipTrigger asChild>
                  <Link
                    href={`/p/${projectId}/overview/boards`}
                    className="flex flex-shrink-0 items-center gap-2 outline-none"
                  >
                    <Image
                      src="/logo-small.png"
                      alt="Starboard Logo"
                      width={32}
                      height={32}
                      className="flex-shrink-0"
                    />

                    <span
                      className={cn(
                        "text-2xl font-extrabold transition-opacity duration-300 ease-in-out",
                        nunito.className,
                        isExpanded ? "opacity-100" : "hidden opacity-0",
                      )}
                    >
                      cardboards
                    </span>
                  </Link>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="right">Cardboards</TooltipContent>
                )}
              </Tooltip>
            </div>

            {/* Main Navigation */}
            <div className={cn("space-y-1", isExpanded ? "px-3" : "px-3")}>
              <Tooltip disableHoverableContent={isExpanded}>
                <TooltipTrigger asChild>
                  <Link href={`/p/${projectId}/overview/boards`}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "h-10 w-full px-0",
                        isExpanded
                          ? "justify-start gap-2 px-3"
                          : "justify-center",
                        pathname === `/p/${projectId}/overview/boards` &&
                          "bg-muted/75",
                      )}
                    >
                      <Kanban className="h-5 w-5 flex-shrink-0" />
                      <span
                        className={cn(
                          "transition-opacity duration-300 ease-in-out",
                          isExpanded ? "opacity-100" : "hidden opacity-0",
                        )}
                      >
                        Dashboard
                      </span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="right">Dashboard</TooltipContent>
                )}
              </Tooltip>

              <Tooltip disableHoverableContent={isExpanded}>
                <TooltipTrigger asChild>
                  <Link href={`/p/${projectId}/analytics/overview`}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "h-10 w-full justify-center px-0",
                        isExpanded
                          ? "justify-start gap-2 px-3"
                          : "justify-center",
                        isActivePathOrSubPath(
                          `/p/${projectId}/analytics/overview`,
                        ) && "bg-muted/75",
                      )}
                    >
                      <ChartArea className="h-5 w-5 flex-shrink-0" />
                      <span
                        className={cn(
                          "transition-opacity duration-300 ease-in-out",
                          isExpanded ? "opacity-100" : "hidden opacity-0",
                        )}
                      >
                        Analytics
                      </span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="right">Analytics</TooltipContent>
                )}
              </Tooltip>
            </div>

            {/* Boards Section */}
            <div
              className={cn(
                "mt-8 flex-1 overflow-y-auto overflow-x-hidden",
                isExpanded ? "px-3" : "px-3",
              )}
            >
              <h4
                className={cn(
                  "mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground transition-opacity duration-300 ease-in-out",
                  isExpanded ? "opacity-100" : "hidden opacity-0",
                )}
              >
                Boards
              </h4>
              <div className="space-y-1">
                {boards.data.map((board) => (
                  <Tooltip key={board.id} disableHoverableContent={isExpanded}>
                    <TooltipTrigger asChild>
                      <Link href={`/p/${projectId}/b/${board.id}`}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "flex h-9 w-full items-center px-0",
                            isExpanded
                              ? "justify-start gap-2 px-3"
                              : "justify-center",
                            isActiveBoardPath(board.id) && "bg-muted/75",
                          )}
                        >
                          <div
                            className="h-4 w-4 flex-shrink-0 rounded-full"
                            style={{ backgroundColor: board.color }}
                          />
                          <span
                            className={cn(
                              "truncate transition-opacity duration-300 ease-in-out",
                              isExpanded ? "opacity-100" : "hidden opacity-0",
                            )}
                          >
                            {board.name}
                          </span>
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    {!isExpanded && (
                      <TooltipContent side="right">{board.name}</TooltipContent>
                    )}
                  </Tooltip>
                ))}

                {isAdmin && (
                  <Tooltip disableHoverableContent={isExpanded}>
                    <TooltipTrigger asChild>
                      <div className={cn(!isExpanded && "flex justify-center")}>
                        <CreateBoardDialog
                          trigger={
                            <Button
                              variant="ghost"
                              className={cn(
                                "flex h-9 w-full items-center text-muted-foreground",
                                isExpanded
                                  ? "justify-start gap-2 px-3"
                                  : "justify-center px-0",
                              )}
                            >
                              <Plus className="h-4 w-4 flex-shrink-0" />
                              <span
                                className={cn(
                                  "transition-opacity duration-300 ease-in-out",
                                  isExpanded
                                    ? "opacity-100"
                                    : "hidden opacity-0",
                                )}
                              >
                                Add Board
                              </span>
                            </Button>
                          }
                          projectId={projectId}
                        />
                      </div>
                    </TooltipTrigger>
                    {!isExpanded && (
                      <TooltipContent side="right">Add Board</TooltipContent>
                    )}
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto space-y-2 px-3 pt-4">
              {/* Theme Toggle */}
              <div
                className={cn(
                  "flex h-10 items-center",
                  isExpanded ? "pl-3" : "justify-center",
                )}
              >
                {isExpanded ? (
                  <div className="flex w-full items-center justify-start gap-2">
                    <Palette className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <span
                      className={cn(
                        "text-sm transition-opacity duration-300 ease-in-out",
                        isExpanded ? "opacity-100" : "hidden opacity-0",
                      )}
                    >
                      Theme
                    </span>
                    <div className="ml-auto">
                      <ThemeToggle isHovered={false} />
                    </div>
                  </div>
                ) : (
                  <ThemeToggle isHovered={false} />
                )}
              </div>

              <Tooltip disableHoverableContent={isExpanded}>
                <TooltipTrigger asChild>
                  <Link href={`/p/${projectId}/settings`}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "h-10 w-full justify-center px-0",
                        isExpanded
                          ? "justify-start gap-2 px-3"
                          : "justify-center",
                        isActivePathOrSubPath(`/p/${projectId}/settings`) &&
                          "bg-muted/75",
                      )}
                    >
                      <Settings className="h-5 w-5 flex-shrink-0" />
                      <span
                        className={cn(
                          "transition-opacity duration-300 ease-in-out",
                          isExpanded ? "opacity-100" : "hidden opacity-0",
                        )}
                      >
                        Settings
                      </span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="right">Settings</TooltipContent>
                )}
              </Tooltip>

              {/* Profile Section */}
              <div
                className={cn(
                  "flex h-10 items-center",
                  isExpanded ? "justify-start gap-2 px-3" : "justify-center",
                )}
              >
                <UserButton afterSignOutUrl="/" />
                <span
                  className={cn(
                    "text-sm transition-opacity duration-300 ease-in-out",
                    isExpanded ? "opacity-100" : "hidden opacity-0",
                  )}
                >
                  Profile
                </span>
              </div>
            </div>
          </div>
        </aside>
      </TooltipProvider>
      <div
        className={cn(
          "pointer-events-none fixed left-0 h-full transition-all duration-300 ease-in-out",
          isExpanded ? "w-[240px]" : "w-[60px]",
        )}
        aria-hidden="true"
      />
    </div>
  );
}
