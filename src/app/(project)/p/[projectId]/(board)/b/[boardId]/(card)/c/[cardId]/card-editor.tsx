"use client";

import { useState } from "react";

import { CardDetailsCommentList } from "~/app/(project)/p/[projectId]/(board)/_components/card-details-comment-list";
import { CardDetailsCreateCommentForm } from "~/app/(project)/p/[projectId]/(board)/_components/card-details-create-comment-form";
import { CardDetailsDescription } from "~/app/(project)/p/[projectId]/(board)/_components/card-details-description";
import { CardDetailsLabels } from "~/app/(project)/p/[projectId]/(board)/_components/card-details-labels";
import { CardDetailsMetadata } from "~/app/(project)/p/[projectId]/(board)/_components/card-details-metadata";
import { CardDetailsTitle } from "~/app/(project)/p/[projectId]/(board)/_components/card-details-title";
import { Badge } from "~/components/ui/badge";
import { Card as CardUI, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { useCard } from "~/lib/hooks/card/use-card";
import { useUpdateCard } from "~/lib/hooks/card/use-update-card";
import { getColor, getPriorityByValue, type Priority } from "~/lib/utils";

interface CardEditorProps {
  cardId: number;
}

export function CardEditor({ cardId }: CardEditorProps) {
  const { data: card, isPending } = useCard(cardId);
  const updateCardMutation = useUpdateCard();
  const [editing, setEditing] = useState<
    "title" | "description" | "dueDate" | null
  >(null);

  if (isPending) {
    return <CardSkeleton />;
  }

  if (!card) {
    return <div>Card not found</div>;
  }

  const priorityInfo = getPriorityByValue(card.priority);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Card Details</h1>
          {priorityInfo && (
            <Badge
              className="px-2.5 py-1 text-xs font-medium"
              style={{
                backgroundColor: getColor(card.priority),
                color: "#FFFFFF",
              }}
            >
              {priorityInfo.label}
            </Badge>
          )}
        </div>
        <p className="font-mono text-sm text-muted-foreground">
          CARD-{card.id}
        </p>
      </div>

      <div className="grid gap-6">
        <CardDetailsTitle
          title={card.title}
          isEditing={editing === "title"}
          isPending={updateCardMutation.isPending}
          onEdit={() => setEditing("title")}
          onBlur={async (value) => {
            if (value !== card.title) {
              await updateCardMutation.mutateAsync({
                cardId: card.id,
                data: { title: value },
              });
            }
            setEditing(null);
          }}
        />

        <CardDetailsDescription
          description={card.description ?? undefined}
          isEditing={editing === "description"}
          isPending={updateCardMutation.isPending}
          onEdit={() => setEditing("description")}
          onBlur={async (content) => {
            if (content !== card.description) {
              await updateCardMutation.mutateAsync({
                cardId: card.id,
                data: { description: content },
              });
            }
            setEditing(null);
          }}
        />

        <CardDetailsMetadata
          dueDate={card.dueDate}
          assignedToId={card.assignedToId}
          priority={card.priority}
          isEditingDueDate={editing === "dueDate"}
          isPendingDueDate={
            updateCardMutation.isPending &&
            updateCardMutation.variables?.data.dueDate !== undefined
          }
          isPendingAssignee={
            updateCardMutation.isPending &&
            updateCardMutation.variables?.data.assignedToId !== undefined
          }
          isPendingPriority={
            updateCardMutation.isPending &&
            updateCardMutation.variables?.data.priority !== undefined
          }
          onEditDueDate={() => setEditing("dueDate")}
          onDueDateChange={async (date) => {
            const currentDate = card.dueDate;
            const newDate = date;

            const hasCurrentDate =
              currentDate !== null && currentDate !== undefined;
            const hasNewDate = newDate !== null && newDate !== undefined;

            const dateChanged =
              (!hasCurrentDate && hasNewDate) ||
              (hasCurrentDate && !hasNewDate) ||
              (hasCurrentDate &&
                hasNewDate &&
                currentDate.getTime() !== newDate.getTime());

            if (dateChanged) {
              await updateCardMutation.mutateAsync({
                cardId: card.id,
                data: { dueDate: date },
              });
            }
            setEditing(null);
          }}
          onAssigneeChange={async (value) => {
            if (value !== (card.assignedToId ?? "")) {
              await updateCardMutation.mutateAsync({
                cardId: card.id,
                data: { assignedToId: value },
              });
            }
          }}
          onPriorityChange={async (value) => {
            if (value !== (card.priority ?? "")) {
              await updateCardMutation.mutateAsync({
                cardId: card.id,
                data: { priority: value as Priority["value"] },
              });
            }
          }}
        />

        <CardUI>
          <CardHeader className="pb-2">
            <h3 className="text-base font-semibold">Labels</h3>
          </CardHeader>
          <CardContent>
            <CardDetailsLabels
              labels={card.labels ?? []}
              isPending={
                updateCardMutation.isPending &&
                updateCardMutation.variables?.data.labels !== undefined
              }
              onTagAdd={async (tag) => {
                const currentTags = card.labels ?? [];
                if (!currentTags.includes(tag)) {
                  await updateCardMutation.mutateAsync({
                    cardId: card.id,
                    data: { labels: [...currentTags, tag] },
                  });
                }
              }}
              onTagRemove={async (tag) => {
                const currentTags = card.labels ?? [];
                if (currentTags.includes(tag)) {
                  await updateCardMutation.mutateAsync({
                    cardId: card.id,
                    data: {
                      labels: currentTags.filter((t) => t !== tag),
                    },
                  });
                }
              }}
            />
          </CardContent>
        </CardUI>

        <CardUI>
          <CardHeader className="pb-2">
            <h3 className="text-base font-semibold">Comments</h3>
          </CardHeader>
          <CardContent>
            <CardDetailsCreateCommentForm cardId={card.id} />
            <Separator className="my-6" />
            <div>
              <CardDetailsCommentList cardId={card.id} />
            </div>
          </CardContent>
        </CardUI>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="grid gap-6">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
