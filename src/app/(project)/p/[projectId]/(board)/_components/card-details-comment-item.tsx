"use client";

import { useAuth } from "@clerk/nextjs";
import { formatDistance } from "date-fns";
import { MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react";
import { useState } from "react";

import { type CardComment } from "~/app/(project)/_types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Textarea } from "~/components/ui/textarea";
import { useRemoveCardComment, useUpdateCardComment } from "~/lib/hooks";

export function CardDetailsCommentItem({ comment }: { comment: CardComment }) {
  const { userId } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const isCommentAuthor = comment.projectUser.userId === userId;

  const removeCardCommentMutation = useRemoveCardComment();
  const updateCardCommentMutation = useUpdateCardComment();

  const handleSaveComment = async () => {
    // Only update if content has changed
    if (editedContent !== comment.content) {
      await updateCardCommentMutation.mutateAsync({
        cardCommentId: comment.id,
        data: {
          content: editedContent,
        },
      });
    }
    setIsEditing(false);
  };

  return (
    <AlertDialog>
      <div className="relative overflow-hidden rounded-md border border-border/40 bg-card/30 p-4 shadow-md transition-all hover:bg-card/50">
        <div className="absolute inset-y-0 left-0 w-1 bg-primary/40"></div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex w-full items-start gap-3">
            <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
              <AvatarImage
                src={comment.projectUser.user.imageUrl ?? undefined}
              />
              <AvatarFallback className="text-xs font-medium">
                {comment.projectUser.user.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex w-full flex-1 flex-col">
              <div className="flex flex-wrap items-baseline gap-2">
                <div className="text-sm font-semibold text-primary">
                  {comment.projectUser.user.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistance(comment.createdAt, new Date(), {
                    addSuffix: true,
                  })}
                </div>
              </div>

              {isEditing ? (
                <div className="mt-3 flex w-full flex-col gap-3">
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full resize-none border-border/40 bg-background text-sm"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSaveComment();
                      }
                    }}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedContent(comment.content);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveComment}
                      disabled={updateCardCommentMutation.isPending}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 whitespace-pre-wrap pl-0.5 text-sm leading-relaxed text-foreground">
                  {comment.content}
                </div>
              )}
            </div>
          </div>

          {isCommentAuthor && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 flex-shrink-0 p-0 opacity-70 hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Comment actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this comment?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={async () => {
              await removeCardCommentMutation.mutateAsync(comment.id);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
