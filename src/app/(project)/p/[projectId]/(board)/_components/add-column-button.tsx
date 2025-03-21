"use client";

import { Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
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
      className="group flex h-full w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 p-6 text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-muted-foreground/20 disabled:hover:bg-muted/20 disabled:hover:text-muted-foreground"
      aria-label="Add new column"
      disabled={!isAdmin}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 transition-colors group-hover:bg-primary/10">
          <Plus className="h-6 w-6 transition-transform group-hover:scale-110" />
        </div>
        <span className="text-sm font-medium">Add new column</span>
      </div>
    </button>
  );

  return (
    <div className="h-full w-[325px] flex-shrink-0 snap-start">
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
