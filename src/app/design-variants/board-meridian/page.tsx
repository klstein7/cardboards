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
  high: "bg-slate-300",
  medium: "bg-slate-500",
  low: "bg-slate-700",
};

function MeridianAvatar({ person }: { person: MockPerson }) {
  return (
    <span
      className="flex size-[22px] items-center justify-center rounded-full text-[9px] font-medium ring-1 ring-white/10"
      style={{
        backgroundColor: `hsl(${person.hue} 25% 20%)`,
        color: `hsl(${person.hue} 50% 78%)`,
      }}
      title={person.name}
    >
      {person.initials}
    </span>
  );
}

function MeridianBoardCard({ card }: { card: MockCard }) {
  return (
    <div className="cursor-grab rounded-xl bg-[#0d1526] p-3.5 ring-1 ring-white/[0.07] transition-shadow hover:ring-white/[0.14]">
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-1.5 size-1.5 shrink-0 rounded-full ${priorityTint[card.priority]}`}
        />
        <p className="text-[13px] leading-snug text-slate-200">{card.title}</p>
      </div>
      <div className="mt-3 flex items-center gap-2.5 pl-4">
        <span className="text-[10px] text-slate-600">{card.label}</span>
        {card.due ? (
          <span
            className={`text-[10px] ${
              card.overdue ? "font-medium text-red-400" : "text-slate-500"
            }`}
          >
            {card.due}
          </span>
        ) : null}
        <span className="ml-auto flex items-center gap-2">
          {card.comments ? (
            <span className="flex items-center gap-1 text-[10px] text-slate-600">
              <IconMessageCircle size={12} strokeWidth={1.5} />
              {card.comments}
            </span>
          ) : null}
          {card.assignee ? <MeridianAvatar person={card.assignee} /> : null}
        </span>
      </div>
    </div>
  );
}

function MeridianSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-white/[0.06] lg:flex">
      <div className="flex items-center gap-2.5 px-5 pb-8 pt-5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-sky-300 text-sm font-semibold text-[#060a12]">
          c
        </span>
        <Link
          href="/design-variants"
          className="font-semibold text-white"
        >
          cardboards
        </Link>
      </div>
      <nav className="space-y-0.5 px-3">
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-200"
        >
          <IconLayoutDashboard size={17} strokeWidth={1.5} />
          Dashboard
        </a>
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-200"
        >
          <IconChartLine size={17} strokeWidth={1.5} />
          Analytics
        </a>
      </nav>
      <p className="mt-8 px-6 text-[11px] font-medium text-slate-600">
        Boards
      </p>
      <div className="mt-1.5 flex-1 space-y-0.5 overflow-y-auto px-3">
        {dashboardBoards.map((board, index) => (
          <a
            key={board.name}
            href="#"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              index === 0
                ? "bg-white/[0.07] text-white"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
            }`}
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: `hsl(${board.hue} 55% 60%)` }}
            />
            {board.name}
          </a>
        ))}
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-white/[0.04] hover:text-slate-300">
          <IconPlus size={13} strokeWidth={1.5} />
          Add board
        </button>
      </div>
      <div className="border-t border-white/[0.06] px-3 py-4">
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-200"
        >
          <IconSettings size={17} strokeWidth={1.5} />
          Settings
        </a>
        <div className="flex items-center gap-3 px-3 py-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-white/[0.07] text-[10px] font-medium text-slate-300">
            KS
          </span>
          <span className="text-sm text-slate-400">Kyle S.</span>
        </div>
      </div>
    </aside>
  );
}

export default function BoardMeridianPage() {
  return (
    <div className="flex h-dvh bg-[#060a12] text-slate-200">
      <MeridianSidebar />

      <div className="flex min-w-0 flex-1 flex-col [background-image:radial-gradient(ellipse_50%_35%_at_50%_-8%,rgba(56,189,248,0.07),transparent)]">
        <header className="flex h-11 shrink-0 items-center gap-1.5 border-b border-white/[0.06] px-5 text-sm">
          <Link
            href="/design-variants"
            className="text-slate-500 transition-colors hover:text-white"
          >
            Projects
          </Link>
          <IconChevronRight size={13} strokeWidth={1.5} className="text-slate-700" />
          <a
            href="#"
            className="text-slate-500 transition-colors hover:text-white"
          >
            Atlas rebuild
          </a>
          <IconChevronRight size={13} strokeWidth={1.5} className="text-slate-700" />
          <span className="flex items-center gap-2 font-medium text-white">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: "hsl(200 55% 60%)" }}
            />
            Launch checklist
          </span>
        </header>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5 border-b border-white/[0.06] px-5 py-3">
          <label className="flex h-8 w-56 items-center gap-2 rounded-lg px-2.5 ring-1 ring-white/[0.09] focus-within:ring-sky-300/50">
            <IconSearch size={14} strokeWidth={1.5} className="text-slate-600" />
            <input
              type="text"
              placeholder="Search cards"
              className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600"
            />
          </label>
          <button className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm text-slate-400 ring-1 ring-white/[0.09] transition-colors hover:text-slate-200 hover:ring-white/20">
            Label
            <IconChevronDown size={13} strokeWidth={1.5} />
          </button>
          <button className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm text-slate-400 ring-1 ring-white/[0.09] transition-colors hover:text-slate-200 hover:ring-white/20">
            Assignee
            <IconChevronDown size={13} strokeWidth={1.5} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden -space-x-1.5 md:flex">
              {[maren, dana, tomas, aisha, yuki].map((person) => (
                <MeridianAvatar key={person.initials} person={person} />
              ))}
            </div>
            <button className="flex h-8 items-center gap-1.5 rounded-lg bg-sky-300 px-3.5 text-sm font-semibold text-[#060a12] transition-colors hover:bg-sky-200">
              <IconPlus size={14} strokeWidth={2} />
              Add card
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <div className="flex h-full min-w-max items-start gap-4 px-4 py-5 md:px-5">
            {boardColumns.map((column) => (
              <section
                key={column.name}
                className="w-72 shrink-0 rounded-2xl bg-white/[0.02] p-3 ring-1 ring-white/[0.05]"
              >
                <div className="flex items-baseline justify-between px-1.5 pb-3">
                  <h2 className="text-[13px] text-slate-400">{column.name}</h2>
                  <span className="font-mono text-[11px] text-sky-300/80">
                    {column.cards.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {column.cards.map((card) => (
                    <MeridianBoardCard key={card.title} card={card} />
                  ))}
                </div>
                <button className="mt-2 flex w-full items-center gap-1.5 rounded-xl px-2 py-2 text-[13px] text-slate-600 transition-colors hover:bg-white/[0.03] hover:text-slate-400">
                  <IconPlus size={13} strokeWidth={1.5} />
                  Add card
                </button>
              </section>
            ))}
            <button className="flex w-72 shrink-0 items-center justify-center gap-1.5 rounded-2xl py-4 text-sm text-slate-600 ring-1 ring-white/[0.05] transition-colors hover:text-slate-400 hover:ring-white/[0.1]">
              <IconPlus size={14} strokeWidth={1.5} />
              New column
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
