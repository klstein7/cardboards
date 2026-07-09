"use client";

// Variant: Topsheet. One full-width column: the facts compress into a single
// hairline strip under the title, then the document and the conversation get
// all the room.

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

export default function PanelTopsheetVariantPage() {
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
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-8">
            <h2 className="text-2xl font-light leading-snug tracking-tight">
              {selected.title}
            </h2>

            <div className="mt-5 flex flex-wrap items-start gap-x-8 gap-y-4 border-y border-border py-3.5">
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
              <div className="ml-auto hidden flex-col gap-1.5 text-right sm:flex">
                <MicroLabel className="text-[10px]">Updated</MicroLabel>
                <span className="font-mono text-xs text-muted-foreground">
                  {selected.updated}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <MicroLabel>Description</MicroLabel>
              <DescriptionBody card={selected} />
            </div>

            <div className="mt-8 border-t border-border pt-5">
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

      <VariantSwitcher active="topsheet" placement="bottom-left" />
    </div>
  );
}
