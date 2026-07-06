"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { useDeleteBoard } from "~/lib/hooks";

interface DeletableBoard {
  id: string;
  projectId: string;
  name: string;
}

interface DeleteBoardDialogProps {
  board: DeletableBoard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteBoardDialog({
  board,
  open,
  onOpenChange,
}: DeleteBoardDialogProps) {
  const router = useRouter();
  const deleteBoardMutation = useDeleteBoard();
  const isDeleting = deleteBoardMutation.isPending;

  const handleDeleteBoard = async () => {
    try {
      const deletedBoard = await deleteBoardMutation.mutateAsync(board.id);
      router.replace(`/p/${deletedBoard.projectId}/overview/boards`);
      toast.success(`Board "${board.name}" deleted successfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to delete board", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isDeleting) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete board?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the board &quot;{board.name}&quot;, its
            columns, and all cards inside it. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void handleDeleteBoard();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete board"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
