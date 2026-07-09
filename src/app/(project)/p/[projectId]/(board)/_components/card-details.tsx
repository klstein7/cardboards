"use client";

import { X } from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useCard, useColumns } from "~/lib/hooks";
import { useUpdateCard } from "~/lib/hooks/card/use-update-card";
import { type Priority } from "~/lib/utils";

import { CardDetailsCommentList } from "./card-details-comment-list";
import { CardDetailsCreateCommentForm } from "./card-details-create-comment-form";
import { CardDetailsDescription } from "./card-details-description";
import { CardDetailsLabels } from "./card-details-labels";
import { CardDetailsMetadata } from "./card-details-metadata";
import { CardDetailsSkeleton } from "./card-details-skeleton";
import { CardDetailsTitle } from "./card-details-title";

export function CardDetails({ boardId }: { boardId: string }) {
  const [selectedCardId, setSelectedCardId] = useQueryState("cardId");

  const card = useCard(selectedCardId ? Number(selectedCardId) : null);
  const columns = useColumns(boardId);
  const updateCardMutation = useUpdateCard();

  const [editing, setEditing] = useState<
    "title" | "description" | "dueDate" | null
  >(null);

  const cardDataRef = useRef<typeof card.data | null>(null);
  useEffect(() => {
    cardDataRef.current = card.data;
  }, [card.data]);

  useEffect(() => {
    setEditing(null);
  }, [selectedCardId]);

  useEffect(() => {
    if (!selectedCardId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") void setSelectedCardId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedCardId, setSelectedCardId]);

  if (!selectedCardId) return null;

  const columnName = columns.data?.find(
    (column) => column.id === card.data?.columnId,
  )?.name;

  const saveChanges = async (data: Record<string, unknown>) => {
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

  return (
    <aside
      className="fixed inset-0 z-50 flex flex-col bg-background md:static md:z-auto md:w-1/2 md:shrink-0 md:border-l md:border-border xl:w-[680px]"
      aria-label={`Card details for card ${selectedCardId}`}
    >
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-border px-5">
        <div className="flex min-w-0 items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em]">
          <span className="shrink-0 text-muted-foreground">
            Card-{selectedCardId}
          </span>
          {columnName && (
            <span className="truncate text-foreground">{columnName}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => void setSelectedCardId(null)}
          aria-label="Close card"
          className="text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {card.isPending ? (
        <CardDetailsSkeleton />
      ) : (
        <div
          key={selectedCardId}
          className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[1fr_240px] md:divide-x md:divide-border md:overflow-y-visible"
        >
          <div className="min-w-0 px-5 py-6 md:overflow-y-auto md:px-7">
            <CardDetailsTitle
              title={card.data?.title}
              isEditing={editing === "title"}
              isPending={false}
              onEdit={() => setEditing("title")}
              onBlur={async (value) => {
                setEditing(null);
                if (value !== cardDataRef.current?.title) {
                  await saveChanges({ title: value });
                }
              }}
            />

            <CardDetailsDescription
              description={card.data?.description ?? undefined}
              isEditing={editing === "description"}
              isPending={false}
              onEdit={() => setEditing("description")}
              onBlur={async (content) => {
                setEditing(null);
                if (content !== cardDataRef.current?.description) {
                  await saveChanges({ description: content });
                }
              }}
            />

            <div className="mt-8 border-t border-border pt-5">
              <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Comments
              </h3>
              <CardDetailsCommentList cardId={Number(selectedCardId)} />
              <div className="mt-4 border-t border-border/60">
                <CardDetailsCreateCommentForm cardId={Number(selectedCardId)} />
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-6 border-t border-border px-5 py-6 md:overflow-y-auto md:border-t-0">
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
                const currentDate = cardDataRef.current?.dueDate;

                const dateChanged =
                  (currentDate == null) !== (date == null) ||
                  (currentDate != null &&
                    date != null &&
                    currentDate.getTime() !== date.getTime());

                if (dateChanged) {
                  await saveChanges({ dueDate: date });
                }
              }}
              onAssigneeChange={async (value) => {
                if (value !== (cardDataRef.current?.assignedToId ?? "")) {
                  await saveChanges({ assignedToId: value });
                }
              }}
              onPriorityChange={async (value) => {
                if (value !== (cardDataRef.current?.priority ?? "")) {
                  await saveChanges({ priority: value as Priority["value"] });
                }
              }}
            />

            <CardDetailsLabels
              labels={card.data?.labels}
              isPending={false}
              onTagAdd={async (tag) => {
                const currentTags = cardDataRef.current?.labels ?? [];
                if (!currentTags.includes(tag)) {
                  await saveChanges({ labels: [...currentTags, tag] });
                }
              }}
              onTagRemove={async (tag) => {
                const currentTags = cardDataRef.current?.labels ?? [];
                if (currentTags.includes(tag)) {
                  await saveChanges({
                    labels: currentTags.filter((t) => t !== tag),
                  });
                }
              }}
            />
          </aside>
        </div>
      )}
    </aside>
  );
}
