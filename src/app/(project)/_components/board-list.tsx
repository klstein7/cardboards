"use client";

import { LayoutGridIcon } from "lucide-react";

import { Button } from "~/components/ui/button";

import { BoardItem } from "./board-item";
import { CreateBoardDialog } from "./create-board-dialog";

export function BoardList({
  projectId,
  boards,
}: {
  projectId: string;
  boards: Array<{
    id: string;
    name: string;
    color: string;
    columns: Array<{
      id: string;
      name: string;
    }>;
    _count?: { cards: number };
  }>;
}) {
  return (
    <div className="mt-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Boards</h2>
      </div>

      {boards.length === 0 ? (
        <EmptyState projectId={projectId} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <BoardItem key={board.id} projectId={projectId} board={board} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ projectId }: { projectId: string }) {
  return (
    <div className="flex h-72 flex-col items-center justify-center rounded-lg border bg-background/50 py-8">
      <LayoutGridIcon className="mb-4 h-10 w-10 text-muted-foreground/60" />
      <p className="mb-2 text-muted-foreground/80">No boards created yet</p>
      <CreateBoardDialog
        trigger={
          <Button variant="outline" size="sm" className="mt-2">
            Create New Board
          </Button>
        }
        projectId={projectId}
      />
    </div>
  );
}
