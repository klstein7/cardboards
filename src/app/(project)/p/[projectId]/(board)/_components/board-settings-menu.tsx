"use client";

import { Pencil, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useBoardSafe } from "~/lib/hooks";
import { useIsAdmin } from "~/lib/hooks/project-user/use-is-admin";

import { CreateColumnDialog } from "./create-column-dialog";
import { DeleteBoardDialog } from "./delete-board-dialog";
import { EditBoardDialog } from "./edit-board-dialog";

interface BoardSettingsMenuProps {
  boardId: string;
}

export function BoardSettingsMenu({ boardId }: BoardSettingsMenuProps) {
  const { data: board } = useBoardSafe(boardId);
  const isAdmin = useIsAdmin();
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [createColumnOpen, setCreateColumnOpen] = useState(false);
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false);

  const boardSettingsButton = (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
      disabled={!isAdmin}
      aria-label="Board settings"
    >
      <SlidersHorizontal className="h-4 w-4" />
    </Button>
  );

  if (!isAdmin) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{boardSettingsButton}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Only admins can manage board settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{boardSettingsButton}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="px-2 py-1 text-xs font-medium text-muted-foreground">
            Board settings
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!board}
            onSelect={() => setEditBoardOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            <span>Edit board</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setCreateColumnOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>New column</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!board}
            onSelect={() => setDeleteBoardOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete board</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {board && (
        <EditBoardDialog
          board={board}
          open={editBoardOpen}
          onOpenChange={setEditBoardOpen}
        />
      )}
      <CreateColumnDialog
        boardId={boardId}
        trigger={null}
        open={createColumnOpen}
        onOpenChange={setCreateColumnOpen}
      />
      {board && (
        <DeleteBoardDialog
          board={board}
          open={deleteBoardOpen}
          onOpenChange={setDeleteBoardOpen}
        />
      )}
    </>
  );
}
