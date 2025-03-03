"use client";

import { Kanban, LoaderCircle, Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useBoards } from "~/lib/hooks";

import { SettingsBoardItem } from "./settings-board-item";

interface SettingsBoardListProps {
  projectId: string;
}

export function SettingsBoardList({ projectId }: SettingsBoardListProps) {
  const boards = useBoards(projectId);
  const totalBoards = boards.data?.length ?? 0;

  if (boards.isPending) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border bg-muted/20 text-muted-foreground">
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        <span>Loading boards...</span>
      </div>
    );
  }

  if (boards.isError) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
        Error loading boards. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">
            {totalBoards} {totalBoards === 1 ? "board" : "boards"}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs sm:text-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="xs:inline hidden">New Board</span>
        </Button>
      </div>

      {boards.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center sm:px-6 sm:py-12">
          <div className="mb-3 rounded-full bg-primary/10 p-2.5 sm:mb-4 sm:p-3">
            <Kanban className="h-8 w-8 text-primary/70 sm:h-10 sm:w-10" />
          </div>
          <h3 className="text-base font-semibold sm:text-lg">
            No boards to manage
          </h3>
          <p className="mb-4 mt-1 max-w-sm text-sm text-muted-foreground sm:mb-6 sm:mt-2">
            Create a board in your project first to manage it here.
          </p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border bg-card">
          {boards.data.map((board) => (
            <SettingsBoardItem key={board.id} board={board} />
          ))}
        </div>
      )}
    </div>
  );
}
