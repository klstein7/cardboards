"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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

  const cardDataRef = useRef<typeof card.data | null>(null);
  useEffect(() => {
    cardDataRef.current = card.data;
  }, [card.data]);

  useEffect(() => {
    if (editing === "title") {
      titleRef.current?.focus();
    } else if (editing === "description") {
      descriptionRef.current?.focus();
    }
  }, [editing]);

  const saveChanges = async (data: Record<string, unknown>) => {
    if (!selectedCardId) return;

    const promise = updateCardMutation.mutateAsync({
      cardId: Number(selectedCardId),
      data,
    });

    toast.promise(promise, {
      loading: "Saving changes...",
      success: "Card updated successfully!",
      error: (err) => {
        console.error("Failed to save changes:", err);
        return err instanceof Error ? err.message : "Failed to save changes";
      },
    });

    await promise.catch(() => {
      /* Catch error to prevent unhandled rejection */
    });
  };

  const handleTitleChange = async (value: string) => {
    if (value !== cardDataRef.current?.title) {
      await saveChanges({ title: value });
    }
  };

  const handleDescriptionChange = async (content: string) => {
    if (content !== cardDataRef.current?.description) {
      await saveChanges({ description: content });
    }
  };

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
        className="relative p-4 sm:p-6 md:max-w-2xl"
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <DialogTitle className="sr-only">
                    Card Details - CARD-{card.data?.id}
                  </DialogTitle>
                  <CardDetailsHeader
                    id={card.data?.id}
                    priority={card.data?.priority}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {selectedCardId && projectId && boardId && (
                    <Link
                      href={`/p/${projectId}/b/${boardId}/c/${selectedCardId}`}
                      className="hidden sm:ml-auto sm:block"
                    >
                      <Button
                        variant="outline"
                        size={"sm"}
                        className="mr-6 w-full gap-1.5 text-xs sm:w-auto"
                      >
                        <FileText className="h-4 w-4" />
                        View full page
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              <DialogDescription className="mt-1.5">
                View or edit card details below
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 overflow-y-auto sm:gap-6">
              <CardDetailsTitle
                title={card.data?.title}
                isEditing={editing === "title"}
                isPending={false}
                onEdit={() => setEditing("title")}
                onBlur={async (value) => {
                  setEditing(null);
                  await handleTitleChange(value);
                }}
              />

              <CardDetailsDescription
                description={card.data?.description ?? undefined}
                isEditing={editing === "description"}
                isPending={false}
                onEdit={() => setEditing("description")}
                onBlur={async (content) => {
                  setEditing(null);
                  await handleDescriptionChange(content);
                }}
              />

              <div className="rounded-lg border bg-card/50 p-3 shadow-sm backdrop-blur-[2px] sm:p-4">
                <CardDetailsMetadata
                  dueDate={card.data?.dueDate}
                  assignedToId={card.data?.assignedToId}
                  priority={card.data?.priority}
                  isEditingDueDate={editing === "dueDate"}
                  isPendingDueDate={false}
                  isPendingAssignee={false}
                  isPendingPriority={false}
                  onEditDueDate={() => setEditing("dueDate")}
                  onDueDateChange={async (date) => {
                    setEditing(null);
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
                      await saveChanges({ dueDate: date });
                    }
                  }}
                  onAssigneeChange={async (value) => {
                    if (value !== (card.data?.assignedToId ?? "")) {
                      await saveChanges({ assignedToId: value });
                    }
                  }}
                  onPriorityChange={async (value) => {
                    if (value !== (card.data?.priority ?? "")) {
                      await saveChanges({
                        priority: value as Priority["value"],
                      });
                    }
                  }}
                />

                <CardDetailsLabels
                  labels={card.data?.labels}
                  isPending={false}
                  onTagAdd={async (tag) => {
                    const currentTags = card.data?.labels ?? [];
                    if (!currentTags.includes(tag)) {
                      await saveChanges({
                        labels: [...currentTags, tag],
                      });
                    }
                  }}
                  onTagRemove={async (tag) => {
                    const currentTags = card.data?.labels ?? [];
                    if (currentTags.includes(tag)) {
                      await saveChanges({
                        labels: currentTags.filter((t) => t !== tag),
                      });
                    }
                  }}
                />
              </div>

              <Separator className="my-1" />

              <div className="rounded-lg border bg-card/50 p-3 shadow-sm backdrop-blur-[2px] sm:p-4">
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
