"use client";

import { ChartArea, Kanban, Plus, Settings, Star } from "lucide-react";
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

  if (boards.isError) throw boards.error;

  if (boards.isPending) return <div>Loading...</div>;

  return (
    <div className="hidden w-14 shrink-0 flex-col items-center gap-12 border-r pb-3 pt-6 sm:flex">
      <div className="flex flex-1 flex-col items-center gap-12">
        <Star className="fill-yellow-500 text-yellow-500" />
        <div className="flex flex-col gap-3">
          <Link href={`/p/${projectId}`}>
            <Button variant="ghost" size="icon">
              <Kanban />
            </Button>
          </Link>
          <Button variant="ghost" size="icon">
            <ChartArea />
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          {boards.data.map((board) => (
            <TooltipProvider key={board.id}>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Link key={board.id} href={`/p/${projectId}/b/${board.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        currentBoardId === board.id && "bg-muted/75 shadow-md",
                      )}
                    >
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: board.color }}
                      />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  style={{
                    backgroundColor: board.color,
                  }}
                >
                  <p>{board.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          <CreateBoardDialog
            trigger={
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            }
            projectId={projectId}
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Link href={`/p/${projectId}/settings`}>
                <Button variant="ghost" size="icon">
                  <Settings />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <UserButton />
      </div>
    </div>
  );
}
