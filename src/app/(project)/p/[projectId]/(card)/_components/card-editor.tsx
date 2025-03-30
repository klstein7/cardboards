"use client";

import { CheckCircle, Save, XCircle } from "lucide-react";
import { useRef, useState } from "react";

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
import { cn } from "~/lib/utils";
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
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  // Create a ref to track the latest card data to avoid dependency issues
  const cardDataRef = useRef(card);
  cardDataRef.current = card;

  // Helper function to save changes
  const saveChanges = async (data: Record<string, unknown>) => {
    if (!card) return;

    try {
      setSaveStatus("saving");
      await updateCardMutation.mutateAsync({
        cardId: card.id,
        data,
      });
      setSaveStatus("saved");
      // Reset to idle after showing "saved" for 2 seconds
      const timer = setTimeout(() => setSaveStatus("idle"), 2000);
      return () => clearTimeout(timer);
    } catch (error) {
      setSaveStatus("error");
      console.error("Failed to save changes:", error);
      // Keep error state showing longer
      const timer = setTimeout(() => setSaveStatus("idle"), 3000);
      return () => clearTimeout(timer);
    }
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
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
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

          <div
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-medium transition-all duration-300",
              saveStatus === "idle" && "opacity-0",
              saveStatus === "saving" &&
                "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-400",
              saveStatus === "saved" &&
                "border-green-200 bg-green-50 text-green-600 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400",
              saveStatus === "error" &&
                "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400",
            )}
          >
            {saveStatus === "saving" && (
              <>
                <Save className="h-3.5 w-3.5 animate-[spin_2s_linear_infinite]" />
                Saving changes...
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                Changes saved
              </>
            )}
            {saveStatus === "error" && (
              <>
                <XCircle className="h-3.5 w-3.5" />
                Failed to save
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <CardDetailsTitle
          title={card.title}
          isEditing={editing === "title"}
          isPending={false}
          onEdit={() => setEditing("title")}
          onBlur={async (value) => {
            setEditing(null);
            await handleTitleChange(value);
          }}
        />

        <CardDetailsDescription
          description={card.description ?? undefined}
          isEditing={editing === "description"}
          isPending={false}
          onEdit={() => setEditing("description")}
          onBlur={async (content) => {
            setEditing(null);
            await handleDescriptionChange(content);
          }}
        />

        <CardDetailsMetadata
          dueDate={card.dueDate}
          assignedToId={card.assignedToId}
          priority={card.priority}
          isEditingDueDate={editing === "dueDate"}
          isPendingDueDate={false}
          isPendingAssignee={false}
          isPendingPriority={false}
          onEditDueDate={() => setEditing("dueDate")}
          onDueDateChange={async (date) => {
            setEditing(null);
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
              await saveChanges({ dueDate: date });
            }
          }}
          onAssigneeChange={async (value) => {
            if (value !== (card.assignedToId ?? "")) {
              await saveChanges({ assignedToId: value });
            }
          }}
          onPriorityChange={async (value) => {
            if (value !== (card.priority ?? "")) {
              await saveChanges({ priority: value as Priority["value"] });
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
              isPending={false}
              onTagAdd={async (tag) => {
                const currentTags = card.labels ?? [];
                if (!currentTags.includes(tag)) {
                  await saveChanges({ labels: [...currentTags, tag] });
                }
              }}
              onTagRemove={async (tag) => {
                const currentTags = card.labels ?? [];
                if (currentTags.includes(tag)) {
                  await saveChanges({
                    labels: currentTags.filter((t) => t !== tag),
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
