import { type Metadata } from "next";

import { BoardBar, Lane } from "../_lib/board-bits";
import { boardColumns } from "../_lib/mock-data";
import { VariantShell } from "../_lib/variant-shell";

export const metadata: Metadata = {
  title: "Broadsheet board variant | cardboards",
};

// Lanes divide the full viewport width: each column is minmax(340px, 1fr),
// so extra screen buys wider lanes and the hairlines run edge to edge. When
// the minimums no longer fit, the board scrolls horizontally as it does now.
export default function BoardBroadsheetPage() {
  return (
    <VariantShell active="broadsheet">
      <div className="flex h-full flex-col">
        <BoardBar />

        <div className="min-h-0 flex-1 overflow-x-auto">
          <div className="grid h-full auto-cols-[calc(100vw-24px)] grid-flow-col grid-rows-[minmax(0,1fr)] divide-x divide-border sm:auto-cols-[minmax(340px,1fr)]">
            {boardColumns.map((column) => (
              <Lane key={column.name} column={column} />
            ))}
          </div>
        </div>
      </div>
    </VariantShell>
  );
}
