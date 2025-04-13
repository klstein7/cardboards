"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { type Column } from "~/app/(project)/_types";
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
import { useDeleteColumn } from "~/lib/hooks";

interface DeleteColumnDialogProps {
  column: Column;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteColumnDialog({
  column,
  open,
  onOpenChange,
}: DeleteColumnDialogProps) {
  const deleteColumnMutation = useDeleteColumn();
  const isDeleting = deleteColumnMutation.isPending;

  const handleDeleteColumn = async () => {
    try {
      await deleteColumnMutation.mutateAsync(column.id);
      toast.success(`Column "${column.name}" deleted successfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to delete column", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the column &quot;{column.name}&quot;
            and all its cards. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void handleDeleteColumn();
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
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
