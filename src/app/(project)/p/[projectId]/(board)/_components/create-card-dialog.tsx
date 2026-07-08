"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  useCachedCardsByCurrentBoard,
  useColumns,
  useCreateCard,
  useProjectUsers,
  useStrictCurrentProjectId,
} from "~/lib/hooks";
import { useStrictCurrentBoardId } from "~/lib/hooks/utils";
import { cn, getColor } from "~/lib/utils";
import { type CardCreate } from "~/server/zod";

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
const PRIORITY_LABEL: Record<(typeof PRIORITIES)[number], string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
const MAX_LABELS = 5;
const MAX_PREVIEW_LABELS = 2;

function toDescriptionHtml(text: string): string | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  const escapeHtml = (line: string) =>
    line
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  return trimmed
    .split(/\n+/)
    .map((line) => `<p>${escapeHtml(line.trim())}</p>`)
    .join("");
}

function RailSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3">
      <p className="font-mono text-[9px] uppercase leading-none tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function RailOption({
  active,
  onClick,
  children,
  trailing,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex w-full items-center gap-2 py-1 text-left text-xs transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      {trailing && <span className="ml-auto shrink-0">{trailing}</span>}
    </button>
  );
}

function RailChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "border px-1.5 py-1 font-mono text-[9px] uppercase leading-none tracking-wider transition-colors",
        active
          ? "border-primary text-primary"
          : "border-border text-muted-foreground hover:border-foreground/60 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function CreateCardComposer({
  initialColumnId,
  onDone,
}: {
  initialColumnId: string;
  onDone: () => void;
}) {
  const projectId = useStrictCurrentProjectId();
  const boardId = useStrictCurrentBoardId();
  const columns = useColumns(boardId);
  const cards = useCachedCardsByCurrentBoard();
  const projectUsers = useProjectUsers(projectId);
  const createCardMutation = useCreateCard();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState(initialColumnId);
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("low");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [assignedToId, setAssignedToId] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [labelDraft, setLabelDraft] = useState("");
  const [dueOpen, setDueOpen] = useState(false);

  const openColumns = [...(columns.data ?? [])]
    .filter((column) => !column.isCompleted)
    .sort((a, b) => a.order - b.order);

  const existingLabels = cards
    .flatMap((card) => card.labels ?? [])
    .filter((label): label is string => Boolean(label));
  const labelChoices = [...new Set([...existingLabels, ...labels])].sort();

  const cardCountByColumn = (targetId: string) =>
    cards.filter((card) => card.columnId === targetId).length;

  const assignee = (projectUsers.data ?? []).find(
    (projectUser) => projectUser.id === assignedToId,
  );

  const canCreate = title.trim().length > 0 && !createCardMutation.isPending;

  const create = async () => {
    if (!canCreate) return;
    const data: CardCreate = {
      title: title.trim(),
      description: toDescriptionHtml(description),
      columnId,
      priority,
      dueDate,
      assignedToId: assignedToId ?? undefined,
      labels: labels.map((label) => ({ id: label, text: label })),
    };
    await createCardMutation.mutateAsync(data);
    onDone();
  };

  const toggleLabel = (label: string) => {
    setLabels((current) =>
      current.includes(label)
        ? current.filter((value) => value !== label)
        : current.length < MAX_LABELS
          ? [...current, label]
          : current,
    );
  };

  const addLabelDraft = () => {
    const label = labelDraft.trim();
    if (!label) return;
    if (!labels.includes(label) && labels.length < MAX_LABELS) {
      setLabels((current) => [...current, label]);
    }
    setLabelDraft("");
  };

  const previewLabels = labels.slice(0, MAX_PREVIEW_LABELS);
  const extraPreviewLabels = labels.length - previewLabels.length;
  const targetColumnName =
    openColumns.find((column) => column.id === columnId)?.name ?? "Column";
  const nextRow = cardCountByColumn(columnId) + 1;

  return (
    <>
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-border pl-3">
        <DialogPrimitive.Title className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          New card
        </DialogPrimitive.Title>
        <DialogPrimitive.Description className="sr-only">
          Write a card and file it into a column on this board.
        </DialogPrimitive.Description>
        <DialogPrimitive.Close
          aria-label="Close"
          className="flex h-full w-9 items-center justify-center border-l border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </DialogPrimitive.Close>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[1fr_248px] md:overflow-visible">
        <div className="flex flex-col px-5 py-4">
          <textarea
            autoFocus
            rows={2}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void create();
              }
            }}
            placeholder="Card title"
            className="w-full resize-none bg-transparent text-lg font-light leading-snug tracking-tight outline-none placeholder:text-muted-foreground/50"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Write the details here — what, why, and how you'll know it's done."
            className="mt-2 min-h-[160px] w-full flex-1 resize-none bg-transparent text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground/50"
          />
        </div>

        <aside className="divide-y divide-border/60 border-t border-border md:overflow-y-auto md:border-l md:border-t-0">
          <RailSection label="Column">
            {openColumns.map((column) => (
              <RailOption
                key={column.id}
                active={column.id === columnId}
                onClick={() => setColumnId(column.id)}
                trailing={
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {String(cardCountByColumn(column.id)).padStart(2, "0")}
                  </span>
                }
              >
                {column.name}
              </RailOption>
            ))}
          </RailSection>

          <RailSection label="Priority">
            {PRIORITIES.map((value) => (
              <RailOption
                key={value}
                active={value === priority}
                onClick={() => setPriority(value)}
              >
                <span
                  className="h-3 w-0.5"
                  style={{ backgroundColor: getColor(value) }}
                  aria-hidden
                />
                {PRIORITY_LABEL[value]}
              </RailOption>
            ))}
          </RailSection>

          <RailSection label="Due">
            <div className="flex items-center gap-1.5">
              <Popover open={dueOpen} onOpenChange={setDueOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1.5 border px-1.5 py-1 font-mono text-[9px] uppercase leading-none tracking-wider transition-colors",
                      dueDate
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground hover:border-foreground/60 hover:text-foreground",
                    )}
                  >
                    <CalendarIcon className="h-3 w-3" />
                    {dueDate ? format(dueDate, "MMM d, yyyy") : "Pick a date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date);
                      setDueOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate(undefined)}
                  aria-label="Clear due date"
                  className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </RailSection>

          <RailSection label="Assignee">
            {projectUsers.data && projectUsers.data.length > 0 ? (
              projectUsers.data.map((projectUser) => {
                const isActive = projectUser.id === assignedToId;
                return (
                  <RailOption
                    key={projectUser.id}
                    active={isActive}
                    onClick={() =>
                      setAssignedToId(isActive ? null : projectUser.id)
                    }
                  >
                    <Avatar className="h-4 w-4 shrink-0">
                      <AvatarImage
                        src={projectUser.user.imageUrl ?? undefined}
                      />
                      <AvatarFallback className="text-[8px]">
                        {projectUser.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{projectUser.user.name}</span>
                  </RailOption>
                );
              })
            ) : (
              <p className="py-1 text-xs text-muted-foreground">No members</p>
            )}
          </RailSection>

          <RailSection label="Labels">
            <div className="flex flex-wrap gap-1.5">
              {labelChoices.map((label) => (
                <RailChip
                  key={label}
                  active={labels.includes(label)}
                  onClick={() => toggleLabel(label)}
                >
                  {label}
                </RailChip>
              ))}
            </div>
            <input
              value={labelDraft}
              onChange={(event) => setLabelDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addLabelDraft();
                }
              }}
              placeholder="New label"
              className={cn(
                "w-full bg-transparent font-mono text-[10px] uppercase tracking-wider outline-none placeholder:normal-case placeholder:text-muted-foreground/50",
                labelChoices.length > 0 && "mt-2",
              )}
            />
          </RailSection>
        </aside>
      </div>

      <div className="shrink-0 border-t border-border">
        <div className="flex items-center justify-between px-5 pt-2.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            Preview
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            {targetColumnName} · row {String(nextRow).padStart(2, "0")}
          </span>
        </div>
        <div className="flex items-center gap-2.5 px-5 pb-3 pt-2">
          <span
            className="h-3 w-0.5 shrink-0"
            style={{ backgroundColor: getColor(priority) }}
            aria-hidden
          />
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-[12.5px]",
              !title.trim() && "italic text-muted-foreground/60",
            )}
          >
            {title.trim() || "Untitled card"}
          </span>
          {dueDate && (
            <span className="shrink-0 font-mono text-[9px] text-muted-foreground">
              {format(dueDate, "MMM d")}
            </span>
          )}
          {previewLabels.map((label) => (
            <span
              key={label}
              className="shrink-0 border border-border px-1.5 py-0.5 font-mono text-[9px] leading-none text-muted-foreground"
            >
              {label}
            </span>
          ))}
          {extraPreviewLabels > 0 && (
            <span className="shrink-0 font-mono text-[9px] text-muted-foreground">
              +{extraPreviewLabels}
            </span>
          )}
          {assignee ? (
            <Avatar className="h-4 w-4 shrink-0">
              <AvatarImage src={assignee.user.imageUrl ?? undefined} />
              <AvatarFallback className="text-[8px]">
                {assignee.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <span className="h-4 w-4 shrink-0" aria-hidden />
          )}
        </div>
      </div>

      <footer className="flex h-12 shrink-0 items-center justify-end gap-2 border-t border-border px-3">
        <DialogPrimitive.Close asChild>
          <Button
            variant="ghost"
            className="h-8 px-3 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground"
          >
            Cancel
          </Button>
        </DialogPrimitive.Close>
        <Button
          onClick={() => void create()}
          disabled={!canCreate}
          isLoading={createCardMutation.isPending}
          className="h-8 bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          Create card
        </Button>
      </footer>
    </>
  );
}

interface CreateCardDialogProps {
  columnId: string;
  trigger: React.ReactNode;
}

export function CreateCardDialog({ columnId, trigger }: CreateCardDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-4rem)] w-[min(860px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col border border-border bg-background outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <CreateCardComposer
            initialColumnId={columnId}
            onDone={() => setOpen(false)}
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
