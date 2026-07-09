"use client";

import { useEffect, useRef } from "react";

import { Skeleton } from "~/components/ui/skeleton";

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

  useEffect(() => {
    if (isEditing) titleRef.current?.focus();
  }, [isEditing]);

  if (isEditing) {
    return isPending ? (
      <Skeleton className="h-16 w-full" />
    ) : (
      <textarea
        ref={titleRef}
        rows={2}
        defaultValue={title}
        className="w-full resize-none border-0 bg-transparent p-0 text-2xl font-light leading-snug tracking-tight focus-visible:outline-none"
        onBlur={async (e) => {
          await onBlur(e.target.value);
        }}
      />
    );
  }

  return (
    <h2
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter") onEdit();
      }}
      className="cursor-text text-2xl font-light leading-snug tracking-tight transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
    >
      {!title || title === "" ? (
        <span className="text-muted-foreground">Click to add title</span>
      ) : (
        title
      )}
    </h2>
  );
}
