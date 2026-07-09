"use client";

// Variant: Worksheet. The panel reads like a printed work order: a ruled,
// full-width facts ledger between title and description, every field a
// labeled row.

import { useState } from "react";

import { BoardShell } from "../_lib/board-shell";
import {
  AssigneeValue,
  CommentComposer,
  CommentThread,
  DescriptionBody,
  DueValue,
  EditableValue,
  LabelChips,
  MicroLabel,
  PriorityValue,
} from "../_lib/detail-bits";
import { defaultCard, type MockCard } from "../_lib/mock-data";
import { PanelFrame } from "../_lib/panel-frame";
import { VariantSwitcher } from "../_lib/switcher";

export default function PanelWorksheetVariantPage() {
  const [selected, setSelected] = useState<MockCard | null>(defaultCard);

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <BoardShell
        selectedId={selected?.id}
        onSelectCard={(card) => setSelected(card)}
        className="min-w-0 flex-1"
      />

      {selected && (
        <PanelFrame card={selected} onClose={() => setSelected(null)}>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-5 pb-6 pt-6 md:px-8">
              <h2 className="text-2xl font-light leading-snug tracking-tight">
                {selected.title}
              </h2>
            </div>

            <dl className="divide-y divide-border/60 border-y border-border">
              <WorksheetRow label="Priority">
                <EditableValue>
                  <PriorityValue priority={selected.priority} />
                </EditableValue>
              </WorksheetRow>
              <WorksheetRow label="Assignee">
                <EditableValue>
                  <AssigneeValue card={selected} />
                </EditableValue>
              </WorksheetRow>
              <WorksheetRow label="Due">
                <EditableValue>
                  <DueValue card={selected} />
                </EditableValue>
              </WorksheetRow>
              <WorksheetRow label="Labels">
                <EditableValue>
                  <LabelChips card={selected} />
                </EditableValue>
              </WorksheetRow>
              <WorksheetRow label="Opened">
                <span className="font-mono text-xs text-muted-foreground">
                  {selected.created}
                </span>
              </WorksheetRow>
              <WorksheetRow label="Updated">
                <span className="font-mono text-xs text-muted-foreground">
                  {selected.updated}
                </span>
              </WorksheetRow>
            </dl>

            <div className="flex flex-col gap-3 px-5 py-6 md:px-8">
              <MicroLabel>Description</MicroLabel>
              <DescriptionBody card={selected} />
            </div>

            <div className="border-t border-border px-5 py-6 md:px-8">
              <div className="flex items-baseline gap-2">
                <MicroLabel>Comments</MicroLabel>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(selected.thread?.length ?? 0).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-1">
                <CommentThread card={selected} />
              </div>
              <div className="border-t border-border/60">
                <CommentComposer />
              </div>
            </div>
          </div>
        </PanelFrame>
      )}

      <VariantSwitcher active="worksheet" placement="bottom-left" />
    </div>
  );
}

function WorksheetRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-4 px-5 py-2.5 md:px-8">
      <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
