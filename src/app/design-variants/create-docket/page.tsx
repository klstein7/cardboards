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
} from "../_lib/mock-data";
import { MockModal, MockModalClose, MockModalTitle } from "../_lib/overlay";
import { VariantSwitcher } from "../_lib/switcher";

const priorities: MockPriority[] = ["low", "medium", "high", "urgent"];

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

function DocketDialog({
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
  const targetColumn = openColumns.find((column) => column.name === columnName);
  const nextRow = (targetColumn?.cards.length ?? 0) + 1;

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
      className="left-1/2 top-1/2 flex max-h-[calc(100dvh-4rem)] w-[min(860px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
    >
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-border pl-3">
        <MockModalTitle className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          New card
        </MockModalTitle>
        <MockModalClose
          aria-label="Close"
          className="flex h-full w-9 items-center justify-center border-l border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </MockModalClose>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[1fr_248px] md:overflow-visible">
        <div className="flex flex-col px-5 py-4">
          <textarea
            autoFocus
            rows={2}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
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
                key={column.name}
                active={column.name === columnName}
                onClick={() => setColumnName(column.name)}
                trailing={
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {String(column.cards.length).padStart(2, "0")}
                  </span>
                }
              >
                {column.name}
              </RailOption>
            ))}
          </RailSection>

          <RailSection label="Priority">
            {priorities.map((value) => (
              <RailOption
                key={value}
                active={value === priority}
                onClick={() => setPriority(value)}
              >
                <span
                  className="h-3 w-0.5"
                  style={{ backgroundColor: priorityColor[value] }}
                  aria-hidden
                />
                {priorityLabel[value]}
              </RailOption>
            ))}
          </RailSection>

          <RailSection label="Due">
            <div className="flex flex-wrap gap-1.5">
              {dueOptions.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={value === due}
                  onClick={() => setDue(value === due ? null : value)}
                  className={cn(
                    "border px-1.5 py-1 font-mono text-[9px] uppercase leading-none tracking-wider transition-colors",
                    value === due
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/60 hover:text-foreground",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </RailSection>

          <RailSection label="Assignee">
            {members.map((person) => {
              const isActive = assignee?.initials === person.initials;
              return (
                <RailOption
                  key={person.initials}
                  active={isActive}
                  onClick={() => setAssignee(isActive ? null : person)}
                >
                  <MemberAvatar
                    person={person}
                    className="h-4 w-4 text-[8px]"
                  />
                  {person.name}
                </RailOption>
              );
            })}
          </RailSection>

          <RailSection label="Labels">
            <div className="flex flex-wrap gap-1.5">
              {labelOptions.map((label) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={labels.includes(label)}
                  onClick={() => toggleLabel(label)}
                  className={cn(
                    "border px-1.5 py-1 font-mono text-[9px] uppercase leading-none tracking-wider transition-colors",
                    labels.includes(label)
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/60 hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </RailSection>
        </aside>
      </div>

      <div className="shrink-0 border-t border-border">
        <div className="flex items-center justify-between px-5 pt-2.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            Preview
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            {columnName} · row {String(nextRow).padStart(2, "0")}
          </span>
        </div>
        <div className="flex items-center gap-2.5 px-5 pb-3 pt-2">
          <span
            className="h-3 w-0.5 shrink-0"
            style={{ backgroundColor: priorityColor[priority] }}
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
          {due && (
            <span className="shrink-0 font-mono text-[9px] text-muted-foreground">
              {due}
            </span>
          )}
          {labels[0] && (
            <span className="shrink-0 border border-border px-1.5 py-0.5 font-mono text-[9px] leading-none text-muted-foreground">
              {labels[0]}
            </span>
          )}
          {assignee ? (
            <MemberAvatar person={assignee} className="h-4 w-4 text-[8px]" />
          ) : (
            <span className="h-4 w-4 shrink-0" aria-hidden />
          )}
        </div>
      </div>

      <footer className="flex h-12 shrink-0 items-center justify-end gap-2 border-t border-border px-3">
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
      </footer>
    </MockModal>
  );
}

export default function DocketPage() {
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
      <DocketDialog
        key={session}
        open={open}
        onOpenChange={setOpen}
        onFile={fileCard}
      />
      <VariantSwitcher active="docket" />
    </>
  );
}
