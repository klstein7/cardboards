"use client";

import { format } from "date-fns";

import { ProjectUserSelect } from "~/app/(project)/_components/project-user-select";
import { DatePicker } from "~/components/ui/date-picker";
import { Skeleton } from "~/components/ui/skeleton";

import { CardPrioritySelect } from "./card-priority-select";

interface CardDetailsMetadataProps {
  dueDate: Date | null | undefined;
  assignedToId: string | null | undefined;
  priority: string | null | undefined;
  isEditingDueDate: boolean;
  isPendingDueDate: boolean;
  isPendingAssignee: boolean;
  isPendingPriority: boolean;
  onEditDueDate: () => void;
  onDueDateChange: (date?: Date) => Promise<void>;
  onAssigneeChange: (value: string) => Promise<void>;
  onPriorityChange: (value: string) => Promise<void>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </span>
  );
}

export function CardDetailsMetadata({
  dueDate,
  assignedToId,
  priority,
  isEditingDueDate,
  isPendingDueDate,
  isPendingAssignee,
  isPendingPriority,
  onEditDueDate,
  onDueDateChange,
  onAssigneeChange,
  onPriorityChange,
}: CardDetailsMetadataProps) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Priority</FieldLabel>
        {isPendingPriority ? (
          <Skeleton className="h-9 w-full" />
        ) : (
          <CardPrioritySelect
            value={priority ?? ""}
            onChange={onPriorityChange}
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Assignee</FieldLabel>
        {isPendingAssignee ? (
          <Skeleton className="h-9 w-full" />
        ) : (
          <ProjectUserSelect
            value={assignedToId ?? ""}
            onChange={onAssigneeChange}
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Due</FieldLabel>
        {isEditingDueDate ? (
          isPendingDueDate ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <DatePicker value={dueDate ?? undefined} onChange={onDueDateChange} />
          )
        ) : (
          <button
            type="button"
            onClick={onEditDueDate}
            className="w-fit text-left transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
          >
            {dueDate ? (
              <span className="font-mono text-xs">
                {format(dueDate, "EEE, MMM d")}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">No due date</span>
            )}
          </button>
        )}
      </div>
    </>
  );
}
