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
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Sparkles className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="w-48">
        <GenerateCardsDialog
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Generate cards</span>
            </DropdownMenuItem>
          }
          boardId={boardId}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
