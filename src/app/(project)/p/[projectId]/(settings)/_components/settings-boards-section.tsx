"use client";

import { Kanban, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { type Board } from "~/app/(project)/_types";
import { DeleteBoardDialog } from "~/app/(project)/p/[projectId]/(board)/_components/delete-board-dialog";
import { EditBoardDialog } from "~/app/(project)/p/[projectId]/(board)/_components/edit-board-dialog";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useBoards } from "~/lib/hooks";
import { useIsAdmin } from "~/lib/hooks/project-user/use-is-admin";

interface SettingsBoardsSectionProps {
  projectId: string;
}

export function SettingsBoardsSection({
  projectId,
}: SettingsBoardsSectionProps) {
  const boards = useBoards(projectId);
  const isAdmin = useIsAdmin();
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (boards.isPending) {
    return (
      <div className="divide-y divide-border border-t border-border">
        {[1, 2, 3].map((row) => (
          <div key={row} className="flex items-center gap-3 py-4">
            <Skeleton className="size-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
    );
  }

  if (boards.isError) {
    return (
      <p className="border-t border-border py-4 text-sm text-destructive">
        Failed to load boards: {boards.error.message}
      </p>
    );
  }

  if (boards.data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 border border-dashed border-border px-4 py-10 text-center">
        <Kanban className="h-5 w-5 text-muted-foreground" />
        <p className="text-lg font-light tracking-tight">No boards yet</p>
        <p className="text-sm text-muted-foreground">
          Create a board from the Boards tab to manage it here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-border border-t border-border">
        {boards.data.map((board) => (
          <div key={board.id} className="group flex items-center gap-3 py-4">
            <span
              className="size-2 shrink-0"
              style={{ backgroundColor: board.color }}
              aria-hidden
            />
            <Link
              href={`/p/${projectId}/b/${board.id}`}
              className="min-w-0 truncate text-sm font-medium transition-colors hover:text-primary"
            >
              {board.name}
            </Link>

            {isAdmin && (
              <div className="ml-auto flex shrink-0 items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 max-sm:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  aria-label={`Edit board ${board.name}`}
                  onClick={() => {
                    setEditingBoard(board);
                    setEditOpen(true);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  aria-label={`Delete board ${board.name}`}
                  onClick={() => {
                    setDeletingBoard(board);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editingBoard && (
        <EditBoardDialog
          board={editingBoard}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
      {deletingBoard && (
        <DeleteBoardDialog
          board={deletingBoard}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      )}
    </>
  );
}
