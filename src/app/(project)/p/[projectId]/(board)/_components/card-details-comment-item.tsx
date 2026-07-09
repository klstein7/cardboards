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
      <div className="group/comment flex gap-3 py-4">
        <Avatar className="h-5 w-5 shrink-0">
          <AvatarImage src={comment.projectUser.user.imageUrl ?? undefined} />
          <AvatarFallback className="text-[9px] font-medium">
            {comment.projectUser.user.name?.[0]}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3">
            <span className="min-w-0 truncate text-[13px] font-medium">
              {comment.projectUser.user.name}
            </span>
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
              {formatDistance(comment.createdAt, new Date(), {
                addSuffix: true,
              })}
            </span>

            {isCommentAuthor && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-6 w-6 shrink-0 self-center text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover/comment:opacity-100 data-[state=open]:opacity-100 max-sm:opacity-100"
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

          {isEditing ? (
            <div className="mt-2 flex w-full flex-col gap-2">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full resize-none text-sm"
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
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {comment.content}
            </p>
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
