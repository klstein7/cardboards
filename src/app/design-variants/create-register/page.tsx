"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { cn } from "~/lib/utils";

import { MemberAvatar } from "../_lib/bits";
import { BoardBackdrop } from "../_lib/board-backdrop";
import {
  dueOptions,
  labelOptions,
  members,
  type MockCard,
  type MockPerson,
  type MockPriority,
  openColumns,
  priorityColor,
  priorityLabel,
  totalCards,
} from "../_lib/mock-data";
import { MockModal, MockModalClose, MockModalTitle } from "../_lib/overlay";
import { VariantSwitcher } from "../_lib/switcher";

const priorities: MockPriority[] = ["low", "medium", "high", "urgent"];

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[84px_1fr] gap-3 px-4 py-3.5">
      <span className="pt-0.5 font-mono text-[9px] uppercase leading-none tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ToggleChip({
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
        "flex items-center gap-1.5 border px-2 py-1 font-mono text-[9px] uppercase leading-none tracking-wider transition-colors",
        active
          ? "border-primary text-primary"
          : "border-border text-muted-foreground hover:border-foreground/60 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function RegisterSheet({
  open,
  onOpenChange,
  onFile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFile: (columnName: string, card: MockCard) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnName, setColumnName] = useState(openColumns[0]?.name ?? "");
  const [priority, setPriority] = useState<MockPriority>("low");
  const [due, setDue] = useState<string | null>(null);
  const [assignee, setAssignee] = useState<MockPerson | null>(null);
  const [labels, setLabels] = useState<string[]>([]);

  const canCreate = title.trim().length > 0;

  const create = () => {
    if (!canCreate) return;
    onFile(columnName, {
      title: title.trim(),
      label: labels[0],
      priority,
      assignee: assignee ?? undefined,
      due: due ?? undefined,
    });
  };

  const toggleLabel = (label: string) => {
    setLabels((current) =>
      current.includes(label)
        ? current.filter((value) => value !== label)
        : [...current, label],
    );
  };

  return (
    <MockModal
      open={open}
      onOpenChange={onOpenChange}
      className="inset-y-0 right-0 flex w-full max-w-[420px] flex-col border-y-0 border-r-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
    >
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border pl-4">
        <MockModalTitle className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          New card
        </MockModalTitle>
        <div className="flex h-full items-center">
          <span className="px-4 font-mono text-[10px] text-muted-foreground">
            Entry {String(totalCards + 1).padStart(2, "0")}
          </span>
          <MockModalClose
            aria-label="Close"
            className="flex h-full w-12 items-center justify-center border-l border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </MockModalClose>
        </div>
      </header>

      <div className="min-h-0 flex-1 divide-y divide-border/60 overflow-y-auto">
        <FieldRow label="Column">
          <div className="flex flex-wrap gap-1.5">
            {openColumns.map((column) => (
              <ToggleChip
                key={column.name}
                active={column.name === columnName}
                onClick={() => setColumnName(column.name)}
              >
                {column.name}
              </ToggleChip>
            ))}
          </div>
        </FieldRow>

        <FieldRow label="Title">
          <textarea
            autoFocus
            rows={2}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs doing?"
            className="w-full resize-none bg-transparent text-sm font-medium leading-snug outline-none placeholder:text-muted-foreground/50"
          />
        </FieldRow>

        <FieldRow label="Description">
          <textarea
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional details"
            className="w-full resize-none bg-transparent text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground/50"
          />
        </FieldRow>

        <FieldRow label="Priority">
          <div className="flex flex-wrap gap-1.5">
            {priorities.map((value) => (
              <ToggleChip
                key={value}
                active={value === priority}
                onClick={() => setPriority(value)}
              >
                <span
                  className="h-2.5 w-0.5"
                  style={{ backgroundColor: priorityColor[value] }}
                  aria-hidden
                />
                {priorityLabel[value]}
              </ToggleChip>
            ))}
          </div>
        </FieldRow>

        <FieldRow label="Due">
          <div className="flex flex-wrap gap-1.5">
            {dueOptions.map((value) => (
              <ToggleChip
                key={value}
                active={value === due}
                onClick={() => setDue(value === due ? null : value)}
              >
                {value}
              </ToggleChip>
            ))}
          </div>
        </FieldRow>

        <FieldRow label="Assignee">
          <div className="flex flex-col">
            {members.map((person) => {
              const isActive = assignee?.initials === person.initials;
              return (
                <button
                  key={person.initials}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setAssignee(isActive ? null : person)}
                  className={cn(
                    "flex items-center gap-2 py-1 text-left text-xs transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <MemberAvatar
                    person={person}
                    className={cn(
                      "h-4 w-4 text-[8px]",
                      isActive && "ring-1 ring-primary",
                    )}
                  />
                  {person.name}
                </button>
              );
            })}
          </div>
        </FieldRow>

        <FieldRow label="Labels">
          <div className="flex flex-wrap gap-1.5">
            {labelOptions.map((label) => (
              <ToggleChip
                key={label}
                active={labels.includes(label)}
                onClick={() => toggleLabel(label)}
              >
                {label}
              </ToggleChip>
            ))}
          </div>
        </FieldRow>
      </div>

      <footer className="flex h-14 shrink-0 items-center justify-between border-t border-border px-4">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          Files under {columnName}
        </span>
        <div className="flex items-center gap-2">
          <MockModalClose className="h-8 px-3 text-xs text-muted-foreground transition-colors hover:text-foreground">
            Cancel
          </MockModalClose>
          <button
            onClick={create}
            disabled={!canCreate}
            className="flex h-8 items-center bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create card
          </button>
        </div>
      </footer>
    </MockModal>
  );
}

export default function RegisterPage() {
  const [open, setOpen] = useState(true);
  const [session, setSession] = useState(0);
  const [added, setAdded] = useState<Record<string, MockCard[]>>({});

  const openComposer = () => {
    setSession((count) => count + 1);
    setOpen(true);
  };

  const fileCard = (columnName: string, card: MockCard) => {
    setAdded((current) => ({
      ...current,
      [columnName]: [...(current[columnName] ?? []), card],
    }));
    setOpen(false);
  };

  return (
    <>
      <BoardBackdrop onNewCard={openComposer} extraCards={added} />
      <RegisterSheet
        key={session}
        open={open}
        onOpenChange={setOpen}
        onFile={fileCard}
      />
      <VariantSwitcher active="register" placement="bottom-left" />
    </>
  );
}
