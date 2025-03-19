"use client";

import { useRef } from "react";

import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";

interface CardDetailsTitleProps {
  title: string | undefined;
  isEditing: boolean;
  isPending: boolean;
  onEdit: () => void;
  onBlur: (value: string) => Promise<void>;
}

export function CardDetailsTitle({
  title,
  isEditing,
  isPending,
  onEdit,
  onBlur,
}: CardDetailsTitleProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="rounded-lg border bg-card/50 p-4 shadow-sm backdrop-blur-[2px]">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Title</span>
        {isEditing ? (
          isPending ? (
            <Skeleton className="h-[56px] w-full" />
          ) : (
            <Textarea
              className="resize-none"
              ref={titleRef}
              defaultValue={title}
              onBlur={async (e) => {
                await onBlur(e.target.value);
              }}
            />
          )
        ) : (
          <div
            role="button"
            className="rounded-md py-1 text-lg font-medium transition-colors hover:bg-muted/50"
            onClick={onEdit}
          >
            {!title || title === "" ? "Click to add title" : title}
          </div>
        )}
      </div>
    </div>
  );
}
