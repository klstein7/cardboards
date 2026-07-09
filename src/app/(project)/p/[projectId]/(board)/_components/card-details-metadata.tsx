"use client";

import { format } from "date-fns";

import { ProjectUserSelect } from "~/app/(project)/_components/project-user-select";
import { DatePicker } from "~/components/ui/date-picker";
import { Skeleton } from "~/components/ui/skeleton";

import { CardDetailsFactRow } from "./card-details-fact-row";
import { CardPrioritySelect } from "./card-priority-select";

const quietTrigger =
  "h-auto w-fit gap-1.5 border-0 bg-transparent p-0 shadow-none transition-colors hover:text-primary focus:ring-0 focus:ring-offset-0";

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
      <CardDetailsFactRow label="Priority">
        {isPendingPriority ? (
          <Skeleton className="h-5 w-28" />
        ) : (
          <CardPrioritySelect
            value={priority ?? ""}
            onChange={onPriorityChange}
            triggerClassName={quietTrigger}
          />
        )}
      </CardDetailsFactRow>

      <CardDetailsFactRow label="Assignee">
        {isPendingAssignee ? (
          <Skeleton className="h-5 w-36" />
        ) : (
          <ProjectUserSelect
            value={assignedToId ?? ""}
            onChange={onAssigneeChange}
            triggerClassName={quietTrigger}
          />
        )}
      </CardDetailsFactRow>

      <CardDetailsFactRow label="Due">
        {isEditingDueDate ? (
          isPendingDueDate ? (
            <Skeleton className="h-5 w-28" />
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
      </CardDetailsFactRow>
    </>
  );
}
