"use client";

import { Skeleton } from "~/components/ui/skeleton";
import { Tiptap } from "~/components/ui/tiptap";

interface CardDetailsDescriptionProps {
  description: string | undefined;
  isEditing: boolean;
  isPending: boolean;
  onEdit: () => void;
  onBlur: (content: string) => Promise<void>;
}

export function CardDetailsDescription({
  description,
  isEditing,
  isPending,
  onEdit,
  onBlur,
}: CardDetailsDescriptionProps) {
  return (
    <div className="rounded-lg border bg-card/50 p-4 shadow-sm backdrop-blur-[2px]">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">
          Description
        </span>
        {isEditing ? (
          isPending ? (
            <Skeleton className="h-[150px] w-full" />
          ) : (
            <Tiptap value={description ?? ""} onBlur={onBlur} autoFocus />
          )
        ) : (
          <div
            role="button"
            className="prose max-w-none rounded-md py-1 transition-colors dark:prose-invert hover:bg-muted/50"
            onClick={onEdit}
            dangerouslySetInnerHTML={{
              __html:
                description === "<p></p>" || !description
                  ? "<p class='text-muted-foreground italic'>Click to edit description</p>"
                  : description,
            }}
          />
        )}
      </div>
    </div>
  );
}
