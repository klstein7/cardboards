"use client";

import { format } from "date-fns";

import { ProjectUserSelect } from "~/app/(project)/_components/project-user-select";
import { DatePicker } from "~/components/ui/date-picker";
import { Skeleton } from "~/components/ui/skeleton";
import { type Priority } from "~/lib/utils";

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
    <div className="rounded-lg border bg-card/50 p-4 shadow-sm backdrop-blur-[2px]">
      <div className="mb-3 text-sm font-medium">Details</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            Due date
          </span>
          {isEditingDueDate ? (
            isPendingDueDate ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <DatePicker
                value={dueDate ?? undefined}
                onChange={onDueDateChange}
              />
            )
          ) : (
            <div
              role="button"
              onClick={onEditDueDate}
              className="rounded-md py-1 transition-colors hover:bg-muted/50"
            >
              {dueDate ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary"></span>
                  {format(dueDate, "MMM d, yyyy")}
                </span>
              ) : (
                <span className="italic text-muted-foreground">
                  Set due date
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            Assignee
          </span>
          {isPendingAssignee ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <ProjectUserSelect
              value={assignedToId ?? ""}
              onChange={onAssigneeChange}
            />
          )}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            Priority
          </span>
          {isPendingPriority ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <CardPrioritySelect
              value={priority ?? ""}
              onChange={onPriorityChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
