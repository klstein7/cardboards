"use client";

import { type Tag, TagInput } from "emblor";
import { useState } from "react";

import { Skeleton } from "~/components/ui/skeleton";
import {
  CARD_LABEL_MAX_COUNT,
  CARD_LABEL_MAX_LENGTH,
} from "~/server/zod";

import { CardDetailsFactRow } from "./card-details-fact-row";

interface CardDetailsLabelsProps {
  labels: string[] | null | undefined;
  isPending: boolean;
  onTagAdd: (tag: string) => Promise<void>;
  onTagRemove: (tag: string) => Promise<void>;
}

export function CardDetailsLabels({
  labels,
  isPending,
  onTagAdd,
  onTagRemove,
}: CardDetailsLabelsProps) {
  const [tags, setTags] = useState<Tag[]>(
    labels?.map((label) => ({ id: label, text: label })) ?? [],
  );
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  return (
    <CardDetailsFactRow label="Labels">
      {isPending ? (
        <Skeleton className="h-8 w-full" />
      ) : (
        <TagInput
          tags={tags}
          activeTagIndex={activeTagIndex}
          setActiveTagIndex={setActiveTagIndex}
          setTags={setTags}
          className="w-full"
          styleClasses={{
            input: "h-8 rounded-none border-0 px-0 text-sm shadow-none",
            inlineTagsContainer:
              "rounded-none border-0 bg-transparent p-0 shadow-none",
            tag: {
              body: "rounded-none border border-border bg-transparent pl-2 font-mono text-[10px] text-muted-foreground whitespace-nowrap",
            },
          }}
          placeholder="Add a label"
          maxTags={CARD_LABEL_MAX_COUNT}
          maxLength={CARD_LABEL_MAX_LENGTH}
          truncate={CARD_LABEL_MAX_LENGTH}
          inputProps={{ maxLength: CARD_LABEL_MAX_LENGTH }}
          onTagAdd={async (tag) => {
            const currentTags = tags.map((t) => t.text);
            if (!currentTags.includes(tag)) {
              await onTagAdd(tag);
            }
          }}
          onTagRemove={async (tag) => {
            const currentTags = tags.map((t) => t.text);
            if (currentTags.includes(tag)) {
              await onTagRemove(tag);
            }
          }}
        />
      )}
    </CardDetailsFactRow>
  );
}
