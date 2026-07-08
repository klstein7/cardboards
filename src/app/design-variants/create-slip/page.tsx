"use client";

import { Calendar, Check, ChevronDown, Tag, UserRound, X } from "lucide-react";
import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
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

function ChipButton({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-6 shrink-0 items-center gap-1.5 border px-2 font-mono text-[9px] uppercase leading-none tracking-wider transition-colors",
        active
          ? "border-border text-foreground"
          : "border-border/70 text-muted-foreground hover:border-foreground/60 hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function OptionRow({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-accent",
        selected ? "text-primary" : "text-foreground",
      )}
    >
      {children}
      {selected && <Check className="ml-auto h-3 w-3 shrink-0" />}
    </button>
  );
}

function SlipComposer({
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
      className="left-1/2 top-[16vh] w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2"
    >
      <header className="flex h-9 items-stretch border-b border-border">
        <MockModalTitle className="flex items-center border-r border-border px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          New card
        </MockModalTitle>
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-accent">
              {columnName}
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-44 p-0">
            {openColumns.map((column) => (
              <OptionRow
                key={column.name}
                selected={column.name === columnName}
                onSelect={() => setColumnName(column.name)}
              >
                {column.name}
              </OptionRow>
            ))}
          </PopoverContent>
        </Popover>
        <div className="flex-1" />
        <MockModalClose
          aria-label="Close"
          className="flex w-9 items-center justify-center border-l border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </MockModalClose>
      </header>

      <div className="px-4 pb-3 pt-4">
        <textarea
          autoFocus
          rows={2}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              create();
            }
          }}
          placeholder="Card title"
          className="w-full resize-none bg-transparent text-base font-medium leading-snug outline-none placeholder:text-muted-foreground/50"
        />
        <textarea
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Add a description — optional"
          className="mt-1 w-full resize-none bg-transparent text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto border-t border-border px-3 py-2.5 scrollbar-none">
        <Popover>
          <PopoverTrigger asChild>
            <ChipButton active>
              <span
                className="h-2.5 w-0.5"
                style={{ backgroundColor: priorityColor[priority] }}
                aria-hidden
              />
              {priorityLabel[priority]}
            </ChipButton>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-40 p-0">
            {priorities.map((value) => (
              <OptionRow
                key={value}
                selected={value === priority}
                onSelect={() => setPriority(value)}
              >
                <span
                  className="h-3 w-0.5"
                  style={{ backgroundColor: priorityColor[value] }}
                  aria-hidden
                />
                {priorityLabel[value]}
              </OptionRow>
            ))}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <ChipButton active={due !== null}>
              <Calendar className="h-3 w-3" />
              {due ?? "Due date"}
            </ChipButton>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-40 p-0">
            {dueOptions.map((value) => (
              <OptionRow
                key={value}
                selected={value === due}
                onSelect={() => setDue(value)}
              >
                {value}
              </OptionRow>
            ))}
            {due && (
              <button
                type="button"
                onClick={() => setDue(null)}
                className="flex w-full items-center gap-2 border-t border-border px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Clear
              </button>
            )}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <ChipButton active={assignee !== null}>
              {assignee ? (
                <>
                  <MemberAvatar
                    person={assignee}
                    className="h-3.5 w-3.5 text-[7px]"
                  />
                  {assignee.name.split(" ")[0]}
                </>
              ) : (
                <>
                  <UserRound className="h-3 w-3" />
                  Assign
                </>
              )}
            </ChipButton>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48 p-0">
            {members.map((person) => (
              <OptionRow
                key={person.initials}
                selected={assignee?.initials === person.initials}
                onSelect={() =>
                  setAssignee(
                    assignee?.initials === person.initials ? null : person,
                  )
                }
              >
                <MemberAvatar person={person} className="h-4 w-4 text-[8px]" />
                {person.name}
              </OptionRow>
            ))}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <ChipButton active={labels.length > 0}>
              <Tag className="h-3 w-3" />
              {labels.length > 0
                ? `${labels[0]}${labels.length > 1 ? ` +${labels.length - 1}` : ""}`
                : "Labels"}
            </ChipButton>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-44 p-0">
            {labelOptions.map((label) => (
              <OptionRow
                key={label}
                selected={labels.includes(label)}
                onSelect={() => toggleLabel(label)}
              >
                {label}
              </OptionRow>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      <footer className="flex h-12 items-center justify-between border-t border-border px-3">
        <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground sm:inline">
          Enter to create · Esc to cancel
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

export default function SlipPage() {
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
      <SlipComposer
        key={session}
        open={open}
        onOpenChange={setOpen}
        onFile={fileCard}
      />
      <VariantSwitcher active="slip" />
    </>
  );
}
