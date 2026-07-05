"use client";

import { Plus } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useIsAdmin } from "~/lib/hooks/project-user/use-is-admin";

import { CreateColumnDialog } from "./create-column-dialog";

interface AddColumnButtonProps {
  boardId: string;
}

export function AddColumnButton({ boardId }: AddColumnButtonProps) {
  const isAdmin = useIsAdmin();

  const buttonContent = (
    <button
      className="flex w-full items-center gap-1.5 px-4 pt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-muted-foreground"
      aria-label="Add new column"
      disabled={!isAdmin}
    >
      <Plus className="h-3.5 w-3.5" />
      <span>New column</span>
    </button>
  );

  return (
    <div className="h-full w-[200px] flex-shrink-0 snap-start">
      {isAdmin ? (
        <CreateColumnDialog boardId={boardId} trigger={buttonContent} />
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
            <TooltipContent>
              <p>Only admins can add columns</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
