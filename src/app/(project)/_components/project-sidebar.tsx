"use client";

import {
  ChartArea,
  Kanban,
  Moon,
  Plus,
  Settings,
  Star,
  Sun,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";

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
  const params = useParams();
  const boards = useBoards(projectId);

  const currentBoardId = params.boardId as string | undefined;

  if (boards.isError) {
    return <div>Error: {boards.error.message}</div>;
  }

  if (boards.isPending) return <ProjectSidebarSkeleton />;

  return (
    <aside className="hidden shrink-0 border-r transition-all duration-300 ease-in-out sm:block md:w-[60px] lg:w-[240px]">
      <div className="flex h-full flex-col py-6">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center px-4 lg:justify-start">
          <Star className="h-6 w-6 flex-shrink-0 fill-yellow-400 text-yellow-400" />
          <span className="ml-3 hidden text-lg font-medium lg:block">
            Kanban
          </span>
        </div>

        {/* Main Navigation */}
        <div className="space-y-1 px-3">
          <Link href={`/p/${projectId}`}>
            <Button
              variant="ghost"
              className="h-10 w-full justify-center px-0 lg:justify-start lg:px-3"
            >
              <Kanban className="h-5 w-5" />
              <span className="ml-3 hidden lg:inline-block">Dashboard</span>
            </Button>
          </Link>
          <Link href={`/p/${projectId}/analytics`}>
            <Button
              variant="ghost"
              className="h-10 w-full justify-center px-0 lg:justify-start lg:px-3"
            >
              <ChartArea className="h-5 w-5" />
              <span className="ml-3 hidden lg:inline-block">Analytics</span>
            </Button>
          </Link>
        </div>

        {/* Boards Section */}
        <div className="mt-8 px-3">
          <div className="mb-2 flex items-center">
            <h3 className="hidden text-sm font-medium text-muted-foreground lg:block">
              Boards
            </h3>
          </div>

          <div className="max-h-[40vh] space-y-1 overflow-y-auto">
            {boards.data.map((board) => (
              <TooltipProvider key={board.id}>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Link href={`/p/${projectId}/b/${board.id}`}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "flex h-9 w-full items-center",
                          "justify-center px-0 lg:justify-start lg:px-3",
                          currentBoardId === board.id && "bg-muted/75",
                        )}
                      >
                        <div
                          className="h-4 w-4 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: board.color }}
                        />
                        <span className="ml-3 hidden truncate lg:block lg:max-w-[180px]">
                          {board.name}
                        </span>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    sideOffset={8}
                    style={{
                      backgroundColor: board.color,
                    }}
                    className="lg:hidden"
                  >
                    <p>{board.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}

            <CreateBoardDialog
              trigger={
                <Button
                  variant="ghost"
                  className="flex h-9 w-full items-center justify-center px-0 text-muted-foreground lg:justify-start lg:px-3"
                >
                  <Plus className="h-4 w-4" />
                  <span className="ml-3 hidden lg:inline-block">Add Board</span>
                </Button>
              }
              projectId={projectId}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto space-y-2 px-3">
          <ThemeToggle />

          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link href={`/p/${projectId}/settings`}>
                  <Button
                    variant="ghost"
                    className="h-10 w-full justify-center px-0 lg:justify-start lg:px-3"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="ml-3 hidden lg:inline-block">
                      Settings
                    </span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8} className="lg:hidden">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex items-center justify-center py-2 lg:justify-start lg:px-3">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </aside>
  );
}
