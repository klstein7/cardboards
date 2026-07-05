import Link from "next/link";

import {
  aisha,
  boardColumns,
  dana,
  maren,
  type MockCard,
  type MockPerson,
  recentActivity,
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
      className="flex size-6 items-center justify-center rounded-full text-[10px] font-medium ring-1 ring-white/10"
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

function MeridianMiniCard({ card }: { card: MockCard }) {
  return (
    <div className="rounded-lg bg-[#0d1526] p-3 ring-1 ring-white/[0.07]">
      <div className="flex items-start gap-2">
        <span
          className={`mt-1.5 size-1.5 shrink-0 rounded-full ${priorityTint[card.priority]}`}
        />
        <p className="text-[13px] leading-snug text-slate-300">{card.title}</p>
      </div>
      <div className="mt-2.5 flex items-center justify-between pl-3.5">
        <span className="text-[10px] text-slate-600">{card.label}</span>
        {card.assignee ? <MeridianAvatar person={card.assignee} /> : null}
      </div>
    </div>
  );
}

function MeridianBoardPanel() {
  const columns = boardColumns
    .slice(0, 3)
    .map((column) => ({ ...column, cards: column.cards.slice(0, 3) }));
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.09] to-white/[0.02] p-px">
      <div className="rounded-2xl bg-[#080e1a]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <span className="text-sm font-medium text-slate-300">
            Launch checklist
          </span>
          <div className="flex -space-x-1.5">
            {[maren, dana, aisha, yuki].map((person) => (
              <MeridianAvatar key={person.initials} person={person} />
            ))}
          </div>
        </div>
        <div className="grid gap-5 p-5 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.name}>
              <div className="flex items-baseline justify-between px-1">
                <span className="text-xs text-slate-500">{column.name}</span>
                <span className="font-mono text-[11px] text-sky-300/80">
                  {column.cards.length}
                </span>
              </div>
              <div className="mt-2.5 space-y-2">
                {column.cards.map((card) => (
                  <MeridianMiniCard key={card.title} card={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const runInFeatures = [
  {
    lead: "Keyboard first.",
    rest: "New card, search, jump to board. Your hands never leave the keys.",
  },
  {
    lead: "One link to invite.",
    rest: "Teammates land on the board signed in and ready to drag.",
  },
  {
    lead: "History that reads itself.",
    rest: "Every move is recorded in plain sentences, not audit codes.",
  },
  {
    lead: "Nothing to install.",
    rest: "A browser tab, fast on hardware nobody would call new.",
  },
];

export default function LandingMeridianPage() {
  return (
    <main className="min-h-dvh bg-[#060a12] text-slate-200 [background-image:radial-gradient(ellipse_70%_45%_at_50%_-12%,rgba(56,189,248,0.11),transparent)]">
      <nav className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/design-variants" className="font-semibold text-white">
            cardboards
          </Link>
          <div className="flex items-center gap-6">
            <a
              href="#sync"
              className="text-sm text-slate-400 transition-colors hover:text-white"
            >
              How it syncs
            </a>
            <a
              href="#start"
              className="rounded-lg bg-sky-300 px-4 py-2 text-sm font-semibold text-[#060a12] transition-colors hover:bg-sky-200"
            >
              Get started
            </a>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pt-20 md:pt-24">
        <h1 className="max-w-3xl text-5xl font-light tracking-tight text-white md:text-7xl">
          Every move, <span className="font-semibold text-sky-300">live</span>{" "}
          on every screen.
        </h1>
        <div className="mt-8 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <p className="max-w-md text-lg leading-relaxed text-slate-400">
            A realtime kanban board for small teams. When a card moves,
            everyone already knows.
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <a
              href="#start"
              className="rounded-lg bg-sky-300 px-5 py-2.5 text-sm font-semibold text-[#060a12] transition-colors hover:bg-sky-200"
            >
              Get started
            </a>
            <a
              href="#sync"
              className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-white/30"
            >
              How it syncs
            </a>
          </div>
        </div>
        <div className="mt-16">
          <MeridianBoardPanel />
        </div>
      </section>

      <section id="sync" className="mx-auto max-w-6xl px-6 py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[5fr_6fr]">
          <div>
            <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl">
              The board narrates itself
            </h2>
            <p className="mt-5 max-w-sm leading-relaxed text-slate-400">
              Moves, comments, and handoffs become a running story. Miss a
              day, read a paragraph, and you are caught up.
            </p>
          </div>
          <div className="rounded-2xl bg-[#080e1a] p-6 ring-1 ring-white/[0.07]">
            <div className="space-y-5">
              {recentActivity.slice(0, 4).map((item, index) => (
                <div key={index} className="flex gap-3">
                  <MeridianAvatar person={item.person} />
                  <div className="min-w-0">
                    <p className="text-sm leading-snug text-slate-300">
                      <span className="font-medium text-white">
                        {item.person.name}
                      </span>{" "}
                      {item.action}
                    </p>
                    {item.target ? (
                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {item.target}
                      </p>
                    ) : null}
                  </div>
                  <span className="ml-auto shrink-0 font-mono text-[11px] text-slate-600">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-2xl px-6 py-28">
          {runInFeatures.map((feature) => (
            <p
              key={feature.lead}
              className="py-5 text-2xl font-light leading-relaxed text-slate-500"
            >
              <span className="font-medium text-white">{feature.lead}</span>{" "}
              {feature.rest}
            </p>
          ))}
        </div>
      </section>

      <section
        id="start"
        className="border-t border-white/[0.06] [background-image:radial-gradient(ellipse_60%_70%_at_50%_115%,rgba(56,189,248,0.10),transparent)]"
      >
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h2 className="text-4xl font-light tracking-tight text-white md:text-5xl">
            Open a board. That is the setup.
          </h2>
          <p className="mt-4 text-slate-400">Free for two boards.</p>
          <a
            href="#start"
            className="mt-8 inline-block rounded-lg bg-sky-300 px-6 py-3 text-sm font-semibold text-[#060a12] transition-colors hover:bg-sky-200"
          >
            Get started
          </a>
        </div>
      </section>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-slate-500">
          <span>cardboards</span>
          <Link
            href="/design-variants"
            className="transition-colors hover:text-white"
          >
            All variants
          </Link>
        </div>
      </footer>
    </main>
  );
}
