import { CheckCircle2, MessageSquare, Plus } from "lucide-react";
import { type Metadata } from "next";

import { cn } from "~/lib/utils";

import {
  avatarStyle,
  boardColumns,
  boardName,
  doneCards,
  members,
  type MockCard,
  priorityColor,
  projectName,
  totalCards,
} from "../_lib/mock-data";
import { VariantShell } from "../_lib/variant-shell";

export const metadata: Metadata = {
  title: "Atlas board variant | cardboards",
};

const overdueCards = boardColumns
  .flatMap((column) => column.cards)
  .filter((card) => card.overdue).length;

const figures = [
  { label: "Open", value: totalCards - doneCards },
  { label: "Overdue", value: overdueCards },
  { label: "Done", value: doneCards },
];

function AtlasCard({
  card,
  isCompleted,
}: {
  card: MockCard;
  isCompleted?: boolean;
}) {
  return (
    <div
      className={cn(
        "group cursor-grab border border-border bg-background p-3 transition-colors hover:border-muted-foreground/40",
        isCompleted && "opacity-60",
      )}
    >
      <h3
        className={cn(
          "text-[13px] font-medium leading-snug",
          isCompleted && "text-muted-foreground line-through",
        )}
      >
        {card.title}
      </h3>
      <div className="mt-2 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
        <span
          className="h-2 w-2 shrink-0"
          style={{
            backgroundColor: isCompleted
              ? "hsl(var(--border))"
              : priorityColor[card.priority],
          }}
        />
        <span>{card.label}</span>
        {card.due && (
          <span className={cn(card.overdue && "text-destructive")}>
            {card.due}
          </span>
        )}
        <span className="ml-auto flex items-center gap-2.5">
          {card.comments && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {card.comments}
            </span>
          )}
          {card.assignee && (
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full text-[8px]"
              style={avatarStyle(card.assignee)}
            >
              {card.assignee.initials}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

export default function BoardAtlasPage() {
  return (
    <VariantShell active="atlas">
      <div className="flex h-full">
        <aside className="hidden w-60 shrink-0 flex-col gap-8 overflow-y-auto border-r border-border px-5 py-6 lg:flex">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {projectName}
            </p>
            <h1 className="mt-1 text-xl font-light tracking-tight">
              {boardName}
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {figures.map((figure) => (
              <div key={figure.label}>
                <p className="font-mono text-2xl font-light tabular-nums">
                  {figure.value}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {figure.label}
                </p>
              </div>
            ))}
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Columns
            </p>
            <div className="mt-2">
              {boardColumns.map((column) => (
                <button
                  key={column.name}
                  className="flex w-full items-center justify-between py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <span className="flex items-center gap-2">
                    {column.isCompleted && (
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                    )}
                    {column.name}
                  </span>
                  <span className="font-mono text-xs">
                    {column.cards.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Members
            </p>
            <div className="mt-2.5 flex -space-x-1.5">
              {members.map((person) => (
                <span
                  key={person.initials}
                  title={person.name}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-medium ring-2 ring-background"
                  style={avatarStyle(person)}
                >
                  {person.initials}
                </span>
              ))}
            </div>
          </div>

          <button className="mt-auto flex h-9 items-center justify-center gap-1.5 border border-border text-sm text-muted-foreground hover:border-foreground/60 hover:text-foreground">
            <Plus className="h-3.5 w-3.5" />
            New column
          </button>
        </aside>

        <div className="bg-grid-pattern flex-1 overflow-x-auto">
          <div className="flex h-full w-fit items-stretch gap-8 px-8 py-6">
            {boardColumns.map((column) => (
              <div
                key={column.name}
                className="flex h-full w-[min(calc(100vw-4rem),300px)] shrink-0 flex-col"
              >
                <div className="flex items-center gap-2">
                  {column.isCompleted && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span
                    className={cn(
                      "text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
                      column.isCompleted && "text-primary",
                    )}
                  >
                    {column.name}
                  </span>
                  <span className="font-mono text-[11px] text-primary">
                    {column.cards.length}
                  </span>
                </div>

                <div className="mt-4 flex flex-1 flex-col gap-2 overflow-y-auto">
                  {column.cards.map((card) => (
                    <AtlasCard
                      key={card.title}
                      card={card}
                      isCompleted={column.isCompleted}
                    />
                  ))}
                  {!column.isCompleted && (
                    <button className="flex h-8 items-center gap-1.5 px-1 text-sm text-muted-foreground hover:text-primary">
                      <Plus className="h-3.5 w-3.5" />
                      Add card
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VariantShell>
  );
}
