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
  urgent: "border-l-red-500",
  high: "border-l-neutral-200",
  medium: "border-l-fuchsia-400",
  low: "border-l-neutral-700",
};

function OrchidBoardCard({ card }: { card: MockCard }) {
  return (
    <div
      className={`cursor-grab rounded-sm border-l-2 bg-[#161217] p-3.5 transition-colors hover:bg-[#1c171d] ${priorityEdge[card.priority]}`}
    >
      <p className="text-sm leading-snug text-neutral-200">{card.title}</p>
      <div className="mt-2.5 flex items-center gap-3 font-mono text-[10px] text-neutral-600">
        <span>{card.label}</span>
        {card.due ? (
          <span className={card.overdue ? "text-red-500" : "text-neutral-500"}>
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
            <span className="text-neutral-400">{card.assignee.initials}</span>
          ) : null}
        </span>
      </div>
    </div>
  );
}

function OrchidSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-neutral-800 lg:flex">
      <div className="px-6 pb-8 pt-6">
        <Link href="/design-variants" className="font-semibold text-white">
          cardboards
        </Link>
      </div>
      <nav className="space-y-1 px-3">
        <a
          href="#"
          className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
        >
          <IconLayoutDashboard size={17} strokeWidth={1.5} />
          Dashboard
        </a>
        <a
          href="#"
          className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
        >
          <IconChartLine size={17} strokeWidth={1.5} />
          Analytics
        </a>
      </nav>
      <p className="mt-8 px-6 text-xs text-neutral-600">Boards</p>
      <div className="mt-2 flex-1 space-y-0.5 overflow-y-auto px-3">
        {dashboardBoards.map((board, index) => (
          <a
            key={board.name}
            href="#"
            className={`flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors ${
              index === 0
                ? "bg-neutral-900 text-white"
                : "text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200"
            }`}
          >
            <span
              className="size-2 rounded-sm"
              style={{ backgroundColor: `hsl(${board.hue} 55% 62%)` }}
            />
            {board.name}
          </a>
        ))}
        <button className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-900 hover:text-neutral-300">
          <IconPlus size={13} strokeWidth={1.5} />
          Add board
        </button>
      </div>
      <div className="border-t border-neutral-800 px-3 py-4">
        <a
          href="#"
          className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
        >
          <IconSettings size={17} strokeWidth={1.5} />
          Settings
        </a>
        <div className="flex items-center gap-3 px-3 py-2">
          <span className="flex size-6 items-center justify-center rounded-sm bg-neutral-800 font-mono text-[10px] text-neutral-300">
            KS
          </span>
          <span className="text-sm text-neutral-400">Kyle S.</span>
        </div>
      </div>
    </aside>
  );
}

export default function BoardOrchidPage() {
  return (
    <div className="flex h-dvh bg-neutral-950 text-neutral-100">
      <OrchidSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-neutral-800 px-5 text-sm">
          <Link
            href="/design-variants"
            className="text-neutral-500 transition-colors hover:text-white"
          >
            Projects
          </Link>
          <span className="text-neutral-700">/</span>
          <a
            href="#"
            className="text-neutral-500 transition-colors hover:text-white"
          >
            Atlas rebuild
          </a>
          <span className="text-neutral-700">/</span>
          <span className="flex items-center gap-2 font-medium text-white">
            <span
              className="size-2 rounded-sm"
              style={{ backgroundColor: "hsl(200 55% 62%)" }}
            />
            Launch checklist
          </span>
        </header>

        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-neutral-800 px-5 py-3">
          <label className="flex h-8 w-56 items-center gap-2 rounded-sm border border-neutral-800 px-2.5 focus-within:border-fuchsia-400/60">
            <IconSearch size={14} strokeWidth={1.5} className="text-neutral-600" />
            <input
              type="text"
              placeholder="Search cards"
              className="w-full bg-transparent text-sm text-neutral-200 outline-none placeholder:text-neutral-600"
            />
          </label>
          <button className="flex h-8 items-center gap-1.5 rounded-sm border border-neutral-800 px-2.5 text-sm text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-200">
            Label
            <IconChevronDown size={13} strokeWidth={1.5} />
          </button>
          <button className="flex h-8 items-center gap-1.5 rounded-sm border border-neutral-800 px-2.5 text-sm text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-200">
            Assignee
            <IconChevronDown size={13} strokeWidth={1.5} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden font-mono text-xs text-neutral-600 md:inline">
              MH TR AK DO YT
            </span>
            <button className="flex h-8 items-center gap-1.5 rounded-sm bg-fuchsia-400 px-3.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-fuchsia-300">
              <IconPlus size={14} strokeWidth={2} />
              Add card
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <div className="flex h-full min-w-max items-start gap-6 px-5 py-5">
            {boardColumns.map((column) => (
              <section key={column.name} className="w-72 shrink-0">
                <div className="flex items-baseline justify-between border-b border-neutral-800 px-0.5 pb-2.5">
                  <h2 className="text-sm text-neutral-300">{column.name}</h2>
                  <span className="font-mono text-[11px] text-fuchsia-400">
                    {column.cards.length}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {column.cards.map((card) => (
                    <OrchidBoardCard key={card.title} card={card} />
                  ))}
                </div>
                <button className="mt-2 flex w-full items-center gap-1.5 rounded-sm px-1 py-2 text-sm text-neutral-600 transition-colors hover:text-fuchsia-300">
                  <IconPlus size={13} strokeWidth={1.5} />
                  Add card
                </button>
              </section>
            ))}
            <button className="flex w-72 shrink-0 items-center justify-center gap-1.5 rounded-sm border border-dashed border-neutral-800 py-3 text-sm text-neutral-600 transition-colors hover:border-neutral-600 hover:text-neutral-300">
              <IconPlus size={14} strokeWidth={1.5} />
              New column
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
