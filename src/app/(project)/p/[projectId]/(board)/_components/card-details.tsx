"use client";

import Link from "next/link";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { useCard } from "~/lib/hooks";
import { useUpdateCard } from "~/lib/hooks/card/use-update-card";
import { useCurrentBoardId } from "~/lib/hooks/utils/use-current-board-id";
import { useCurrentProjectId } from "~/lib/hooks/utils/use-current-project-id";
import { type Priority } from "~/lib/utils";

import { CardDetailsCommentList } from "./card-details-comment-list";
import { CardDetailsCreateCommentForm } from "./card-details-create-comment-form";
import { CardDetailsDescription } from "./card-details-description";
import { CardDetailsHeader } from "./card-details-header";
import { CardDetailsLabels } from "./card-details-labels";
import { CardDetailsMetadata } from "./card-details-metadata";
import { CardDetailsSkeleton } from "./card-details-skeleton";
import { CardDetailsTitle } from "./card-details-title";

export function CardDetails() {
  const [selectedCardId, setSelectedCardId] = useQueryState("cardId");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const projectId = useCurrentProjectId();
  const boardId = useCurrentBoardId();

  const card = useCard(selectedCardId ? Number(selectedCardId) : null);
  const updateCardMutation = useUpdateCard();

  const [editing, setEditing] = useState<
    "title" | "description" | "dueDate" | null
  >(null);

  useEffect(() => {
    if (editing === "title") {
      titleRef.current?.focus();
    } else if (editing === "description") {
      descriptionRef.current?.focus();
    }
  }, [editing]);

  return (
    <Dialog
      open={!!selectedCardId}
      onOpenChange={(v) => {
        if (!v) {
          void setSelectedCardId(null);
        }
      }}
    >
      <DialogContent
        className="md:max-w-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {card.isPending ? (
          <DialogHeader>
            <DialogTitle className="sr-only">Card Details</DialogTitle>
            <CardDetailsSkeleton />
          </DialogHeader>
        ) : (
          <>
            <DialogHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="sr-only">
                    Card Details - CARD-{card.data?.id}
                  </DialogTitle>
                  <CardDetailsHeader
                    id={card.data?.id}
                    priority={card.data?.priority}
                  />
                </div>
                {selectedCardId && projectId && boardId && (
                  <Link
                    href={`/p/${projectId}/b/${boardId}/c/${selectedCardId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto mr-8"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide-external-link"
                      >
                        <path d="M15 3h6v6" />
                        <path d="M10 14 21 3" />
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      </svg>
                      Open full page
                    </Button>
                  </Link>
                )}
              </div>
              <DialogDescription className="mt-1.5">
                View or edit card details below
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-6">
              <CardDetailsTitle
                title={card.data?.title}
                isEditing={editing === "title"}
                isPending={updateCardMutation.isPending}
                onEdit={() => setEditing("title")}
                onBlur={async (value) => {
                  if (value !== card.data?.title) {
                    await updateCardMutation.mutateAsync({
                      cardId: Number(selectedCardId),
                      data: { title: value },
                    });
                  }
                  setEditing(null);
                }}
              />

              <CardDetailsDescription
                description={card.data?.description ?? undefined}
                isEditing={editing === "description"}
                isPending={updateCardMutation.isPending}
                onEdit={() => setEditing("description")}
                onBlur={async (content) => {
                  if (content !== card.data?.description) {
                    await updateCardMutation.mutateAsync({
                      cardId: Number(selectedCardId),
                      data: { description: content },
                    });
                  }
                  setEditing(null);
                }}
              />

              <div className="rounded-lg border bg-card/50 p-4 shadow-sm backdrop-blur-[2px]">
                <CardDetailsMetadata
                  dueDate={card.data?.dueDate}
                  assignedToId={card.data?.assignedToId}
                  priority={card.data?.priority}
                  isEditingDueDate={editing === "dueDate"}
                  isPendingDueDate={
                    updateCardMutation.isPending &&
                    updateCardMutation.variables?.data.dueDate !== undefined
                  }
                  isPendingAssignee={
                    updateCardMutation.isPending &&
                    updateCardMutation.variables?.data.assignedToId !==
                      undefined
                  }
                  isPendingPriority={
                    updateCardMutation.isPending &&
                    updateCardMutation.variables?.data.priority !== undefined
                  }
                  onEditDueDate={() => setEditing("dueDate")}
                  onDueDateChange={async (date) => {
                    const currentDate = card.data?.dueDate;
                    const newDate = date;

                    const hasCurrentDate =
                      currentDate !== null && currentDate !== undefined;
                    const hasNewDate =
                      newDate !== null && newDate !== undefined;

                    const dateChanged =
                      (!hasCurrentDate && hasNewDate) ||
                      (hasCurrentDate && !hasNewDate) ||
                      (hasCurrentDate &&
                        hasNewDate &&
                        currentDate.getTime() !== newDate.getTime());

                    if (dateChanged) {
                      await updateCardMutation.mutateAsync({
                        cardId: Number(selectedCardId),
                        data: { dueDate: date },
                      });
                    }
                    setEditing(null);
                  }}
                  onAssigneeChange={async (value) => {
                    if (value !== (card.data?.assignedToId ?? "")) {
                      await updateCardMutation.mutateAsync({
                        cardId: Number(selectedCardId),
                        data: { assignedToId: value },
                      });
                    }
                  }}
                  onPriorityChange={async (value) => {
                    if (value !== (card.data?.priority ?? "")) {
                      await updateCardMutation.mutateAsync({
                        cardId: Number(selectedCardId),
                        data: { priority: value as Priority["value"] },
                      });
                    }
                  }}
                />

                <CardDetailsLabels
                  labels={card.data?.labels}
                  isPending={
                    updateCardMutation.isPending &&
                    updateCardMutation.variables?.data.labels !== undefined
                  }
                  onTagAdd={async (tag) => {
                    const currentTags = card.data?.labels ?? [];
                    if (!currentTags.includes(tag)) {
                      await updateCardMutation.mutateAsync({
                        cardId: Number(selectedCardId),
                        data: { labels: [...currentTags, tag] },
                      });
                    }
                  }}
                  onTagRemove={async (tag) => {
                    const currentTags = card.data?.labels ?? [];
                    if (currentTags.includes(tag)) {
                      await updateCardMutation.mutateAsync({
                        cardId: Number(selectedCardId),
                        data: {
                          labels: currentTags.filter((t) => t !== tag),
                        },
                      });
                    }
                  }}
                />
              </div>

              <Separator className="my-1" />

              <div className="rounded-lg border bg-card/50 p-4 shadow-sm backdrop-blur-[2px]">
                <h3 className="mb-4 text-sm font-medium">Comments</h3>
                <CardDetailsCreateCommentForm cardId={Number(selectedCardId)} />
                <div className="mt-4">
                  <CardDetailsCommentList cardId={Number(selectedCardId)} />
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
