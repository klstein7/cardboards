"use client";

import { useSearchParams } from "next/navigation";

import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

interface FilterIndicatorProps {
  className?: string;
}

export function FilterIndicator({ className }: FilterIndicatorProps) {
  const searchParams = useSearchParams();

  let activeFilterCount = 0;

  if (searchParams.get("search")) {
    activeFilterCount += 1;
  }

  const labels = searchParams.getAll("labels");
  if (labels.length > 0) {
    activeFilterCount += labels.length;
  }

  const assignedTo = searchParams.getAll("assignedTo");
  if (assignedTo.length > 0) {
    activeFilterCount += assignedTo.length;
  }

  if (activeFilterCount === 0) {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      className={cn("text-xs font-semibold", className)}
    >
      {activeFilterCount}
    </Badge>
  );
}
