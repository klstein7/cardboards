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
  const isEmpty = description === "<p></p>" || !description;

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        Description
      </span>

      {isEditing ? (
        isPending ? (
          <Skeleton className="h-36 w-full" />
        ) : (
          <Tiptap value={description ?? ""} onBlur={onBlur} autoFocus />
        )
      ) : isEmpty ? (
        <div
          role="button"
          tabIndex={0}
          onClick={onEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEdit();
          }}
          className="border border-dashed border-border px-4 py-6 transition-colors hover:border-foreground/40 focus-visible:border-foreground/40 focus-visible:outline-none"
        >
          <p className="text-sm text-muted-foreground">
            No description yet. Click to add one.
          </p>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={onEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEdit();
          }}
          className="prose prose-sm max-w-[65ch] cursor-text dark:prose-invert focus-visible:outline-none"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
    </div>
  );
}
