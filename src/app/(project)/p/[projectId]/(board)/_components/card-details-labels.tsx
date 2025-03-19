"use client";

import { type Tag, TagInput } from "emblor";
import { useState } from "react";

import { Skeleton } from "~/components/ui/skeleton";

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
    <div className="mt-4 flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">Labels</span>
      {isPending ? (
        <Skeleton className="h-9 w-full" />
      ) : (
        <TagInput
          tags={tags}
          activeTagIndex={activeTagIndex}
          setActiveTagIndex={setActiveTagIndex}
          setTags={setTags}
          className="w-full"
          styleClasses={{
            input: "h-9",
            inlineTagsContainer: "pl-1 py-0.5",
          }}
          placeholder="Enter a topic"
          maxTags={5}
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
    </div>
  );
}
