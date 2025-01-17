"use client";

import { useAuth } from "@clerk/nextjs";
import { formatDistance } from "date-fns";
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
import { Textarea } from "~/components/ui/textarea";
import { useRemoveCardComment, useUpdateCardComment } from "~/lib/hooks";

export function CardDetailsCommentItem({ comment }: { comment: CardComment }) {
  const { userId } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const isCommentAuthor = comment.projectUser.userId === userId;

  const removeCardCommentMutation = useRemoveCardComment();
  const updateCardCommentMutation = useUpdateCardComment();

  return (
    <AlertDialog>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.projectUser.user.imageUrl ?? undefined} />
          <AvatarFallback>{comment.projectUser.user.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex grow flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <div className="text-sm font-medium">
              {comment.projectUser.user.name}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDistance(comment.createdAt, new Date(), {
                addSuffix: true,
              })}
            </div>
          </div>
          {isEditing ? (
            <div className="flex flex-col gap-3">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full grow resize-none rounded-md border p-2 text-sm"
                rows={3}
              />
              <div className="flex items-center gap-2">
                <p
                  role="button"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(comment.content);
                  }}
                >
                  Cancel
                </p>
                <p
                  role="button"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={async () => {
                    await updateCardCommentMutation.mutateAsync({
                      cardCommentId: comment.id,
                      data: {
                        content: editedContent,
                      },
                    });
                    setIsEditing(false);
                  }}
                >
                  Save
                </p>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">{comment.content}</div>
          )}
          {isCommentAuthor && !isEditing && (
            <div className="flex items-center gap-2">
              <p
                role="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </p>
              <AlertDialogTrigger asChild>
                <p
                  role="button"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Delete
                </p>
              </AlertDialogTrigger>
            </div>
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
