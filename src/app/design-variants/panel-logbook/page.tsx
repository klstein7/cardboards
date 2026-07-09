"use client";

// Variant: Logbook. Conversation-first: the comment thread owns the right
// half full-height with the composer docked at the bottom, and the facts fold
// into a compact block under the title.

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

export default function PanelLogbookVariantPage() {
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
          <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-2 md:divide-x md:divide-border md:overflow-y-visible">
            <div className="min-w-0 px-5 py-6 md:overflow-y-auto md:px-7">
              <h2 className="text-2xl font-light leading-snug tracking-tight">
                {selected.title}
              </h2>

              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5">
                <div className="flex flex-col gap-1.5">
                  <MicroLabel className="text-[10px]">Priority</MicroLabel>
                  <EditableValue>
                    <PriorityValue priority={selected.priority} />
                  </EditableValue>
                </div>
                <div className="flex flex-col gap-1.5">
                  <MicroLabel className="text-[10px]">Assignee</MicroLabel>
                  <EditableValue>
                    <AssigneeValue card={selected} />
                  </EditableValue>
                </div>
                <div className="flex flex-col gap-1.5">
                  <MicroLabel className="text-[10px]">Due</MicroLabel>
                  <EditableValue>
                    <DueValue card={selected} />
                  </EditableValue>
                </div>
                <div className="flex flex-col gap-1.5">
                  <MicroLabel className="text-[10px]">Labels</MicroLabel>
                  <EditableValue>
                    <LabelChips card={selected} />
                  </EditableValue>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 border-t border-border pt-5">
                <MicroLabel>Description</MicroLabel>
                <DescriptionBody card={selected} />
              </div>
            </div>

            <div className="flex min-h-0 flex-col border-t border-border md:border-t-0">
              <div className="flex shrink-0 items-baseline gap-2 border-b border-border px-5 py-3">
                <MicroLabel>Comments</MicroLabel>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(selected.thread?.length ?? 0).padStart(2, "0")}
                </span>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5">
                <CommentThread card={selected} />
              </div>
              <div className="shrink-0 border-t border-border px-5 pb-5">
                <CommentComposer />
              </div>
            </div>
          </div>
        </PanelFrame>
      )}

      <VariantSwitcher active="logbook" placement="bottom-left" />
    </div>
  );
}
