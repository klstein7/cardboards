"use client";

import { ArrowLeft, MoreHorizontal, Trash } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { BaseToolbar } from "~/components/shared/base-toolbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
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
import { useDeleteCard } from "~/lib/hooks/card/use-delete-card";

interface CardToolbarProps {
  cardId: number;
}

export function CardToolbar({ cardId }: CardToolbarProps) {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;
  const projectId = params.projectId as string;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: card } = useCard(cardId);
  const deleteCardMutation = useDeleteCard();

  const handleDeleteCard = async () => {
    if (!card) return;

    try {
      await deleteCardMutation.mutateAsync({
        cardId: card.id,
      });

      toast.success("Card deleted successfully");

      // Navigate back to the board
      router.push(`/p/${projectId}/b/${boardId}`);
    } catch (error: unknown) {
      console.error("Error deleting card:", error);

      toast.error("Failed to delete the card. Please try again.");
    }
  };

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
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            <span className="text-sm">Delete card</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this card and all of its data,
              including comments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  return <BaseToolbar left={cardInfo} right={cardActions} />;
}
