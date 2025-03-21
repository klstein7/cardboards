"use client";

import { ArrowLeft, MoreHorizontal, Trash } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { BaseToolbar } from "~/components/shared/base-toolbar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useCard } from "~/lib/hooks/card/use-card";

interface CardToolbarProps {
  cardId: number;
}

export function CardToolbar({ cardId }: CardToolbarProps) {
  const params = useParams();
  const boardId = params.boardId as string;
  const projectId = params.projectId as string;

  const { data: card } = useCard(cardId);

  // Card info section (left side)
  const cardInfo = (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/p/${projectId}/b/${boardId}`}>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Back to board</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex items-center">
        <span className="text-xs font-medium text-muted-foreground">
          {card ? `CARD-${card.id}` : "Loading..."}
        </span>
      </div>
    </div>
  );

  // Card actions (right side)
  const cardActions = (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            <span className="text-sm">Delete card</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return <BaseToolbar left={cardInfo} right={cardActions} />;
}
