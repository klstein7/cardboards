import {
  IconChartLine,
  IconChevronDown,
  IconLayoutDashboard,
  IconMessageCircle,
  IconPlus,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";

import {
  boardColumns,
  dashboardBoards,
  type MockCard,
} from "../_lib/mock-data";

const priorityEdge: Record<string, string> = {
  urgent: "border-l-red-600",
  high: "border-l-neutral-900",
  medium: "border-l-neutral-400",
  low: "border-l-neutral-200",
};

function LitmusBoardCard({ card }: { card: MockCard }) {
  return (
    <div
      className={`cursor-grab border border-neutral-200 border-l-2 bg-white p-3.5 transition-colors hover:border-neutral-400 ${priorityEdge[card.priority]}`}
    >
      <p className="text-sm leading-snug text-neutral-800">{card.title}</p>
      <div className="mt-2.5 flex items-center gap-3 font-mono text-[10px] text-neutral-400">
        <span>{card.label}</span>
        {card.due ? (
          <span className={card.overdue ? "text-red-600" : "text-neutral-500"}>
            {card.due}
          </span>
        ) : null}
        <span className="ml-auto flex items-center gap-3">
          {card.comments ? (
            <span className="flex items-center gap-1">
              <IconMessageCircle size={11} strokeWidth={1.5} />
              {card.comments}
            </span>
          ) : null}
          {card.assignee ? (
            <span className="text-neutral-600">{card.assignee.initials}</span>
          ) : null}
        </span>
      </div>
    </div>
  );
}

function LitmusSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-neutral-300 lg:flex">
      <div className="px-6 pb-8 pt-6">
        <Link href="/design-variants" className="font-semibold text-neutral-950">
          cardboards
        </Link>
      </div>
      <nav className="space-y-1 px-3">
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-500 transition-colors hover:text-neutral-950"
        >
          <IconLayoutDashboard size={17} strokeWidth={1.5} />
          Dashboard
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-500 transition-colors hover:text-neutral-950"
        >
          <IconChartLine size={17} strokeWidth={1.5} />
          Analytics
        </a>
      </nav>
      <p className="mt-8 px-6 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
        Boards
      </p>
      <div className="mt-2 flex-1 space-y-0.5 overflow-y-auto px-3">
        {dashboardBoards.map((board, index) => (
          <a
            key={board.name}
            href="#"
            className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
              index === 0
                ? "bg-lime-300 font-medium text-neutral-950"
                : "text-neutral-500 hover:text-neutral-950"
            }`}
          >
            <span
              className="size-2"
              style={{ backgroundColor: `hsl(${board.hue} 55% 45%)` }}
            />
            {board.name}
          </a>
        ))}
        <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-neutral-400 transition-colors hover:text-neutral-700">
          <IconPlus size={13} strokeWidth={1.5} />
          Add board
        </button>
      </div>
      <div className="border-t border-neutral-300 px-3 py-4">
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-500 transition-colors hover:text-neutral-950"
        >
          <IconSettings size={17} strokeWidth={1.5} />
          Settings
        </a>
        <div className="flex items-center gap-3 px-3 py-2">
          <span className="flex size-6 items-center justify-center bg-neutral-950 font-mono text-[10px] text-lime-300">
            KS
          </span>
          <span className="text-sm text-neutral-600">Kyle S.</span>
        </div>
      </div>
    </aside>
  );
}

export default function BoardLitmusPage() {
  return (
    <div className="flex h-dvh bg-neutral-100 text-neutral-900">
      <LitmusSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-neutral-300 px-5 text-sm">
          <Link
            href="/design-variants"
            className="text-neutral-500 transition-colors hover:text-neutral-950"
          >
            Projects
          </Link>
          <span className="text-neutral-400">/</span>
          <a
            href="#"
            className="text-neutral-500 transition-colors hover:text-neutral-950"
          >
            Atlas rebuild
          </a>
          <span className="text-neutral-400">/</span>
          <span className="flex items-center gap-2 font-medium text-neutral-950">
            <span
              className="size-2"
              style={{ backgroundColor: "hsl(200 55% 45%)" }}
            />
            Launch checklist
          </span>
        </header>

        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-neutral-300 px-5 py-3">
          <label className="flex h-8 w-56 items-center gap-2 border border-neutral-300 bg-white px-2.5 focus-within:border-neutral-950">
            <IconSearch size={14} strokeWidth={1.5} className="text-neutral-400" />
            <input
              type="text"
              placeholder="Search cards"
              className="w-full bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
            />
          </label>
          <button className="flex h-8 items-center gap-1.5 border border-neutral-300 px-2.5 text-sm text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-950">
            Label
            <IconChevronDown size={13} strokeWidth={1.5} />
          </button>
          <button className="flex h-8 items-center gap-1.5 border border-neutral-300 px-2.5 text-sm text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-950">
            Assignee
            <IconChevronDown size={13} strokeWidth={1.5} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden font-mono text-xs text-neutral-400 md:inline">
              MH TR AK DO YT
            </span>
            <button className="flex h-8 items-center gap-1.5 bg-neutral-950 px-3.5 text-sm font-semibold text-lime-300 transition-colors hover:bg-neutral-800">
              <IconPlus size={14} strokeWidth={2} />
              Add card
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <div className="flex h-full min-w-max items-stretch divide-x divide-neutral-300">
            {boardColumns.map((column) => (
              <section key={column.name} className="flex w-72 flex-col p-4">
                <div className="flex items-baseline justify-between px-0.5 pb-4">
                  <h2 className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                    {column.name}
                  </h2>
                  <span className="bg-lime-300 px-1.5 font-mono text-[11px] text-neutral-950">
                    {column.cards.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {column.cards.map((card) => (
                    <LitmusBoardCard key={card.title} card={card} />
                  ))}
                </div>
                <button className="mt-2 flex w-full items-center gap-1.5 px-1 py-2 text-sm text-neutral-400 transition-colors hover:text-neutral-950">
                  <IconPlus size={13} strokeWidth={1.5} />
                  Add card
                </button>
              </section>
            ))}
            <section className="flex w-72 flex-col p-4">
              <button className="flex items-center gap-1.5 px-0.5 text-[11px] uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:text-neutral-950">
                <IconPlus size={12} strokeWidth={1.5} />
                New column
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
