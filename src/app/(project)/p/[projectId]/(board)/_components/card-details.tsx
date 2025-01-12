"use client";

import { type Tag, TagInput } from "emblor";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";

import { ProjectUserSelect } from "~/app/(project)/_components/project-user-select";
import { DatePicker } from "~/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { Tiptap } from "~/components/ui/tiptap";
import { useCard } from "~/lib/hooks";
import { useUpdateCard } from "~/lib/hooks/card/use-update-card";
import { type Priority } from "~/lib/utils";

import { CardPrioritySelect } from "./card-priority-select";

export function CardDetails() {
  const [selectedCardId, setSelectedCardId] = useQueryState("cardId");
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const card = useCard(selectedCardId ? Number(selectedCardId) : null);

  const updateCardMutation = useUpdateCard();

  const [editing, setEditing] = useState<"title" | "description" | null>(null);

  useEffect(() => {
    if (editing === "title") {
      titleRef.current?.focus();
    } else if (editing === "description") {
      descriptionRef.current?.focus();
    }
  }, [editing]);

  useEffect(() => {
    if (card.data?.labels) {
      setTags(card.data.labels.map((label) => ({ id: label, text: label })));
    }
  }, [card.data?.labels]);

  return (
    <Dialog
      open={!!selectedCardId}
      onOpenChange={(v) => {
        if (!v) {
          void setSelectedCardId(null);
        }
      }}
    >
      {card.isPending ? (
        <DialogContent
          className="md:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle asChild>
              <Skeleton className="h-10 w-36" />
            </DialogTitle>
            <DialogDescription asChild>
              <Skeleton className="h-5 w-48" />
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-8 w-full" />
            </div>

            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>

            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-[240px]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </DialogContent>
      ) : (
        <DialogContent
          className="md:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {card.data?.column.board.name?.slice(0, 2).toUpperCase()}-
              {card.data?.id}
            </DialogTitle>
            <DialogDescription>
              View or edit card details below
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Title</span>
              {editing === "title" ? (
                <Textarea
                  className="resize-none"
                  ref={titleRef}
                  defaultValue={card.data?.title}
                  onBlur={(e) => {
                    if (e.target.value !== card.data?.title) {
                      updateCardMutation.mutate({
                        cardId: Number(selectedCardId),
                        data: {
                          title: e.target.value,
                        },
                      });
                    }
                    setEditing(null);
                  }}
                />
              ) : (
                <div
                  role="button"
                  className="rounded-md text-lg font-medium"
                  onClick={() => {
                    setEditing("title");
                    titleRef.current?.focus();
                  }}
                >
                  {!card.data?.title || card.data.title === ""
                    ? "Click to add title"
                    : card.data.title}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Description</span>
              {editing === "description" ? (
                <Tiptap
                  value={card.data?.description ?? ""}
                  onBlur={(content) => {
                    if (content !== card.data?.description) {
                      updateCardMutation.mutate({
                        cardId: Number(selectedCardId),
                        data: {
                          description: content,
                        },
                      });
                    }
                    setEditing(null);
                  }}
                  autoFocus
                />
              ) : (
                <div
                  role="button"
                  className="prose prose-invert max-w-none"
                  onClick={() => {
                    setEditing("description");
                  }}
                  dangerouslySetInnerHTML={{
                    __html:
                      card.data?.description === "<p></p>" ||
                      !card.data?.description
                        ? "<p>Click to edit</p>"
                        : card.data.description,
                  }}
                />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Due date</span>
              <DatePicker
                value={card.data?.dueDate ?? undefined}
                onChange={(date) => {
                  updateCardMutation.mutate({
                    cardId: Number(selectedCardId),
                    data: { dueDate: date },
                  });
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Assignee</span>
                <ProjectUserSelect
                  value={card.data?.assignedToId ?? ""}
                  onChange={(value) => {
                    updateCardMutation.mutate({
                      cardId: Number(selectedCardId),
                      data: { assignedToId: value },
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Priority</span>
                <CardPrioritySelect
                  value={card.data?.priority ?? ""}
                  onChange={(value) => {
                    updateCardMutation.mutate({
                      cardId: Number(selectedCardId),
                      data: { priority: value as Priority["value"] },
                    });
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Labels</span>
              <TagInput
                tags={tags}
                activeTagIndex={activeTagIndex}
                setActiveTagIndex={setActiveTagIndex}
                setTags={setTags}
                className="sm:min-w-[450px]"
                styleClasses={{
                  input: "h-9",
                  inlineTagsContainer: "pl-1 py-0.5",
                }}
                placeholder="Enter a topic"
                maxTags={5}
                onTagAdd={(tag) => {
                  updateCardMutation.mutate({
                    cardId: Number(selectedCardId),
                    data: { labels: [...tags.map((t) => t.text), tag] },
                  });
                }}
                onTagRemove={(tag) => {
                  updateCardMutation.mutate({
                    cardId: Number(selectedCardId),
                    data: {
                      labels: tags.map((t) => t.text).filter((t) => t !== tag),
                    },
                  });
                }}
              />
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
