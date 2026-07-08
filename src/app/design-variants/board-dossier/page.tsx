import { X } from "lucide-react";
import { type Metadata } from "next";

import { BoardBar, Lane } from "../_lib/board-bits";
import {
  avatarStyle,
  boardColumns,
  dossierCard,
  dossierComments,
  dossierDescription,
  priorityColor,
} from "../_lib/mock-data";
import { VariantShell } from "../_lib/variant-shell";

export const metadata: Metadata = {
  title: "Dossier board variant | cardboards",
};

// Lanes keep their reading width; the extra screen goes to a persistent
// detail panel on the right that replaces the card dialog. Selecting an
// entry fills the panel; below xl the panel yields and entries open as the
// overlay they do today.
export default function BoardDossierPage() {
  return (
    <VariantShell active="dossier">
      <div className="flex h-full flex-col">
        <BoardBar />

        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 overflow-x-auto">
            <div className="grid h-full auto-cols-[calc(100vw-24px)] grid-flow-col grid-rows-[minmax(0,1fr)] divide-x divide-border sm:auto-cols-[minmax(320px,1fr)]">
              {boardColumns.map((column) => (
                <Lane
                  key={column.name}
                  column={column}
                  selectedTitle={dossierCard.title}
                />
              ))}
            </div>
          </div>

          <aside className="hidden w-[440px] shrink-0 flex-col border-l border-border xl:flex">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="px-6 pb-5 pt-5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    In progress
                  </span>
                  <button
                    className="ml-auto text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Close card details"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <h2 className="mt-3 text-xl font-light leading-snug tracking-tight">
                  {dossierCard.title}
                </h2>
              </div>

              <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 border-t border-border px-6 py-5">
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Priority
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <span
                    className="h-3.5 w-0.5"
                    style={{
                      backgroundColor: priorityColor[dossierCard.priority],
                    }}
                  />
                  Urgent
                </span>

                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Due
                </span>
                <span className="font-mono text-xs">{dossierCard.due}</span>

                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Assignee
                </span>
                {dossierCard.assignee && (
                  <span className="flex items-center gap-2 text-sm">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-medium"
                      style={avatarStyle(dossierCard.assignee)}
                    >
                      {dossierCard.assignee.initials}
                    </span>
                    {dossierCard.assignee.name}
                  </span>
                )}

                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Labels
                </span>
                <span>
                  <span className="border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {dossierCard.label}
                  </span>
                </span>
              </div>

              <div className="border-t border-border px-6 py-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Description
                </p>
                <div className="mt-3 flex flex-col gap-3">
                  {dossierDescription.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-sm leading-relaxed text-foreground/90"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div className="border-t border-border px-6 py-5">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Comments
                  </p>
                  <span className="flex h-4 min-w-4 items-center justify-center bg-primary px-1 font-mono text-[9px] text-primary-foreground">
                    {dossierComments.length}
                  </span>
                </div>
                <div className="mt-1 divide-y divide-border">
                  {dossierComments.map((comment) => (
                    <div key={comment.body} className="py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-medium"
                          style={avatarStyle(comment.author)}
                        >
                          {comment.author.initials}
                        </span>
                        <span className="text-xs font-medium">
                          {comment.author.name}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {comment.timeAgo}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                        {comment.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-border p-4">
              <div className="border border-border px-3 py-2 text-sm text-muted-foreground">
                Add a comment
              </div>
            </div>
          </aside>
        </div>
      </div>
    </VariantShell>
  );
}
