import { Plus } from "lucide-react";
import { type Metadata } from "next";

import { labelFilters, Lane, laneAccent } from "../_lib/board-bits";
import {
  avatarStyle,
  boardColumns,
  boardName,
  doneCards,
  members,
  totalCards,
} from "../_lib/mock-data";
import { VariantShell } from "../_lib/variant-shell";

export const metadata: Metadata = {
  title: "Index board variant | cardboards",
};

// The toolbar dissolves into a fixed left rail: board title, a stage index
// with counts, label filters, and members live in what used to be the empty
// margin, and the lanes divide all remaining width. Below lg the rail
// collapses into a compact top bar and the board reads as it does today.
export default function BoardIndexPage() {
  return (
    <VariantShell active="index">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 lg:hidden">
          <h1 className="text-xl font-light tracking-tight">{boardName}</h1>
          <span className="font-mono text-xs text-muted-foreground">
            {totalCards} cards · {doneCards} done
          </span>
          <button className="ml-auto flex h-8 items-center gap-1.5 bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" />
            New card
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-[260px] shrink-0 flex-col overflow-y-auto border-r border-border lg:flex">
            <div className="px-5 pb-5 pt-6">
              <h1 className="text-2xl font-light tracking-tight">
                {boardName}
              </h1>
              <p className="mt-1.5 font-mono text-xs text-muted-foreground">
                {totalCards} cards · {doneCards} done
              </p>
            </div>

            <div className="border-t border-border px-5 py-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Stages
              </p>
              <div className="mt-3 flex flex-col gap-2.5">
                {boardColumns.map((column) => (
                  <button
                    key={column.name}
                    className="group flex items-center gap-2.5 text-left"
                  >
                    <span
                      className="h-3.5 w-0.5"
                      style={{ backgroundColor: laneAccent[column.name] }}
                    />
                    <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                      {column.name}
                    </span>
                    <span className="ml-auto font-mono text-xs text-muted-foreground">
                      {column.cards.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border px-5 py-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Labels
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {labelFilters.map((label) => (
                  <button
                    key={label}
                    className="border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border px-5 py-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Members
              </p>
              <div className="mt-3 flex flex-col gap-2.5">
                {members.map((person) => (
                  <div key={person.initials} className="flex items-center gap-2.5">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-medium"
                      style={avatarStyle(person)}
                    >
                      {person.initials}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {person.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-border p-5">
              <button className="flex h-8 w-full items-center justify-center gap-1.5 bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                <Plus className="h-3.5 w-3.5" />
                New card
              </button>
            </div>
          </aside>

          <div className="min-w-0 flex-1 overflow-x-auto">
            <div className="grid h-full auto-cols-[calc(100vw-24px)] grid-flow-col grid-rows-[minmax(0,1fr)] divide-x divide-border sm:auto-cols-[minmax(340px,1fr)]">
              {boardColumns.map((column) => (
                <Lane key={column.name} column={column} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </VariantShell>
  );
}
