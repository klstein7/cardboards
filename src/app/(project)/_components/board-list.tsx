"use client";

import { LayoutGridIcon, PlusIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useBoards } from "~/lib/hooks";
import { cn } from "~/lib/utils";

import { BoardItem } from "./board-item";
import { CreateBoardDialog } from "./create-board-dialog";

interface BoardListProps {
  projectId: string;
}

export function BoardList({ projectId }: BoardListProps) {
  const boards = useBoards(projectId);
  const totalBoards = boards.data?.length ?? 0;

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Boards</h2>
          {totalBoards > 0 && (
            <span className="inline-flex h-6 items-center rounded-full bg-secondary px-2 text-xs font-medium">
              {totalBoards}
            </span>
          )}
        </div>

        {totalBoards > 0 && (
          <CreateBoardDialog
            trigger={
              <Button size="sm" className="gap-1.5">
                <PlusIcon className="h-4 w-4" />
                <span>New Board</span>
              </Button>
            }
            projectId={projectId}
          />
        )}
      </div>

      {boards.data?.length === 0 ? (
        <EmptyState projectId={projectId} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {boards.data?.map((board) => (
            <BoardItem key={board.id} projectId={projectId} board={board} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ projectId }: { projectId: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-3">
        <LayoutGridIcon className="h-10 w-10 text-primary/70" />
      </div>
      <h3 className="text-xl font-semibold">No boards yet</h3>
      <p className="mb-6 mt-2 max-w-sm text-muted-foreground">
        Create your first board to start organizing your project tasks and track
        your progress.
      </p>
      <CreateBoardDialog
        trigger={
          <Button className="gap-1.5">
            <PlusIcon className="h-4 w-4" />
            <span>Create First Board</span>
          </Button>
        }
        projectId={projectId}
      />
    </div>
  );
}
