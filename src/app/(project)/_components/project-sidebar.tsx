"use client";

import { ChartArea, Kanban, Plus, Star } from "lucide-react";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { useBoards } from "~/lib/hooks";

import { CreateBoardDialog } from "./create-board-dialog";

interface ProjectSidebarProps {
  projectId: string;
}

export function ProjectSidebar({ projectId }: ProjectSidebarProps) {
  const boards = useBoards(projectId);

  if (boards.isError) throw boards.error;

  if (boards.isPending) return <div>Loading...</div>;

  return (
    <div className="flex w-14 shrink-0 flex-col items-center gap-12 border-r py-6">
      <Star className="fill-yellow-500 text-yellow-500" />
      <div className="flex flex-col gap-3">
        <Button variant="ghost" size="icon">
          <Kanban />
        </Button>
        <Button variant="ghost" size="icon">
          <ChartArea />
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        {boards.data.map((board) => (
          <Link key={board.id} href={`/p/${projectId}/b/${board.id}`}>
            <Button variant="ghost" size="icon">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: board.color }}
              />
            </Button>
          </Link>
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
  );
}
