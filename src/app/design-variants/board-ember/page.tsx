import {
  IconChartLine,
  IconChevronDown,
  IconChevronRight,
  IconLayoutDashboard,
  IconMessageCircle,
  IconPlus,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";

import {
  aisha,
  boardColumns,
  dana,
  dashboardBoards,
  maren,
  type MockCard,
  type MockPerson,
  tomas,
  yuki,
} from "../_lib/mock-data";

const priorityTint: Record<string, string> = {
  urgent: "bg-red-400",
  high: "bg-amber-400",
  medium: "bg-stone-400",
  low: "bg-stone-600",
};

function EmberAvatar({ person }: { person: MockPerson }) {
  return (
    <span
      className="flex size-6 items-center justify-center rounded-full text-[10px] font-medium"
      style={{
        backgroundColor: `hsl(${person.hue} 25% 22%)`,
        color: `hsl(${person.hue} 45% 78%)`,
      }}
      title={person.name}
    >
      {person.initials}
    </span>
  );
}

function EmberBoardCard({ card }: { card: MockCard }) {
  return (
    <div className="cursor-grab rounded-2xl border border-stone-800 bg-stone-900 p-4 transition-colors hover:border-stone-700">
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-1.5 size-1.5 shrink-0 rounded-full ${priorityTint[card.priority]}`}
        />
        <p className="text-sm leading-snug text-stone-200">{card.title}</p>
      </div>
      <div className="mt-3 flex items-center gap-2.5 pl-4">
        <span className="rounded-full bg-stone-800 px-2.5 py-0.5 text-[10px] font-medium text-stone-400">
          {card.label}
        </span>
        {card.due ? (
          <span
            className={`text-[11px] ${
              card.overdue ? "font-medium text-red-400" : "text-stone-500"
            }`}
          >
            {card.due}
          </span>
        ) : null}
        <span className="ml-auto flex items-center gap-2">
          {card.comments ? (
            <span className="flex items-center gap-1 text-[11px] text-stone-500">
              <IconMessageCircle size={13} strokeWidth={1.5} />
              {card.comments}
            </span>
          ) : null}
          {card.assignee ? <EmberAvatar person={card.assignee} /> : null}
        </span>
      </div>
    </div>
  );
}

function EmberSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-stone-800/70 lg:flex">
      <div className="px-6 pb-8 pt-6">
        <Link href="/design-variants" className="font-semibold text-stone-50">
          cardboards
        </Link>
      </div>
      <nav className="space-y-1 px-3">
        <a
          href="#"
          className="flex items-center gap-3 rounded-full px-4 py-2 text-sm text-stone-400 transition-colors hover:bg-stone-900 hover:text-stone-100"
        >
          <IconLayoutDashboard size={17} strokeWidth={1.5} />
          Dashboard
        </a>
        <a
          href="#"
          className="flex items-center gap-3 rounded-full px-4 py-2 text-sm text-stone-400 transition-colors hover:bg-stone-900 hover:text-stone-100"
        >
          <IconChartLine size={17} strokeWidth={1.5} />
          Analytics
        </a>
      </nav>
      <p className="mt-8 px-7 text-xs font-medium text-stone-600">Boards</p>
      <div className="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
        {dashboardBoards.map((board, index) => (
          <a
            key={board.name}
            href="#"
            className={`flex items-center gap-3 rounded-full px-4 py-2 text-sm transition-colors ${
              index === 0
                ? "bg-stone-900 font-medium text-stone-50"
                : "text-stone-400 hover:bg-stone-900 hover:text-stone-100"
            }`}
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: `hsl(${board.hue} 50% 62%)` }}
            />
            {board.name}
          </a>
        ))}
        <button className="flex w-full items-center gap-3 rounded-full px-4 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-900 hover:text-stone-300">
          <IconPlus size={13} strokeWidth={1.5} />
          Add board
        </button>
      </div>
      <div className="border-t border-stone-800/70 px-3 py-4">
        <a
          href="#"
          className="flex items-center gap-3 rounded-full px-4 py-2 text-sm text-stone-400 transition-colors hover:bg-stone-900 hover:text-stone-100"
        >
          <IconSettings size={17} strokeWidth={1.5} />
          Settings
        </a>
        <div className="flex items-center gap-3 px-4 py-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-stone-800 text-[10px] font-medium text-stone-300">
            KS
          </span>
          <span className="text-sm text-stone-400">Kyle S.</span>
        </div>
      </div>
    </aside>
  );
}

export default function BoardEmberPage() {
  return (
    <div className="flex h-dvh bg-stone-950 text-stone-200">
      <EmberSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-11 shrink-0 items-center gap-1.5 border-b border-stone-800/70 px-5 text-sm">
          <Link
            href="/design-variants"
            className="text-stone-500 transition-colors hover:text-stone-50"
          >
            Projects
          </Link>
          <IconChevronRight size={13} strokeWidth={1.5} className="text-stone-700" />
          <a
            href="#"
            className="text-stone-500 transition-colors hover:text-stone-50"
          >
            Atlas rebuild
          </a>
          <IconChevronRight size={13} strokeWidth={1.5} className="text-stone-700" />
          <span className="flex items-center gap-2 font-medium text-stone-50">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: "hsl(200 50% 62%)" }}
            />
            Launch checklist
          </span>
        </header>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5 border-b border-stone-800/70 px-5 py-3">
          <label className="flex h-9 w-56 items-center gap-2 rounded-full border border-stone-800 px-3.5 focus-within:border-stone-600">
            <IconSearch size={14} strokeWidth={1.5} className="text-stone-600" />
            <input
              type="text"
              placeholder="Search cards"
              className="w-full bg-transparent text-sm text-stone-200 outline-none placeholder:text-stone-600"
            />
          </label>
          <button className="flex h-9 items-center gap-1.5 rounded-full border border-stone-800 px-3.5 text-sm text-stone-400 transition-colors hover:border-stone-600 hover:text-stone-200">
            Label
            <IconChevronDown size={13} strokeWidth={1.5} />
          </button>
          <button className="flex h-9 items-center gap-1.5 rounded-full border border-stone-800 px-3.5 text-sm text-stone-400 transition-colors hover:border-stone-600 hover:text-stone-200">
            Assignee
            <IconChevronDown size={13} strokeWidth={1.5} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden -space-x-1.5 md:flex">
              {[maren, dana, tomas, aisha, yuki].map((person) => (
                <EmberAvatar key={person.initials} person={person} />
              ))}
            </div>
            <button className="flex h-9 items-center gap-1.5 rounded-full bg-amber-400 px-4 text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-300">
              <IconPlus size={14} strokeWidth={2.5} />
              Add card
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <div className="flex h-full min-w-max items-start gap-5 px-4 py-5 md:px-5">
            {boardColumns.map((column) => (
              <section key={column.name} className="w-80 shrink-0">
                <div className="flex items-center justify-between px-1">
                  <span className="rounded-full bg-stone-900 px-3.5 py-1.5 text-sm font-medium text-stone-200">
                    {column.name}
                  </span>
                  <span className="text-xs text-stone-500">
                    {column.cards.length} cards
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {column.cards.map((card) => (
                    <EmberBoardCard key={card.title} card={card} />
                  ))}
                </div>
                <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-stone-800 py-2.5 text-sm text-stone-500 transition-colors hover:border-stone-600 hover:text-stone-300">
                  <IconPlus size={14} strokeWidth={1.5} />
                  Add card
                </button>
              </section>
            ))}
            <button className="flex w-80 shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-dashed border-stone-800 py-3 text-sm text-stone-500 transition-colors hover:border-stone-600 hover:text-stone-300">
              <IconPlus size={15} strokeWidth={1.5} />
              New column
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
