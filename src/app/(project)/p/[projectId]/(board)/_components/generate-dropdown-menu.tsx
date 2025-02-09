"use client";

import { Sparkles } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { GenerateCardsDialog } from "./generate-cards-dialog";

interface GenerateDropdownMenuProps {
  boardId: string;
}

export function GenerateDropdownMenu({ boardId }: GenerateDropdownMenuProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline">
          <Sparkles className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" sideOffset={8}>
        <GenerateCardsDialog
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate cards
              </div>
            </DropdownMenuItem>
          }
          boardId={boardId}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
