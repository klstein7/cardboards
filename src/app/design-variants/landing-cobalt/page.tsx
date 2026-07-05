import Link from "next/link";

import { boardColumns, type MockCard } from "../_lib/mock-data";

const priorityEdge: Record<string, string> = {
  urgent: "border-l-red-500",
  high: "border-l-neutral-200",
  medium: "border-l-blue-400",
  low: "border-l-neutral-700",
};

function CobaltMiniCard({ card }: { card: MockCard }) {
  return (
    <div
      className={`border-l-2 border border-neutral-800 bg-[#111318] p-3 ${priorityEdge[card.priority]}`}
    >
      <p className="text-[13px] leading-snug text-neutral-300">{card.title}</p>
      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-neutral-600">
        <span>{card.label}</span>
        {card.assignee ? <span>{card.assignee.initials}</span> : null}
      </div>
    </div>
  );
}

function CobaltBoardPanel() {
  const columns = boardColumns
    .slice(0, 3)
    .map((column) => ({ ...column, cards: column.cards.slice(0, 3) }));
  return (
    <div className="border border-neutral-800">
      <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-2.5">
        <span className="font-mono text-xs text-neutral-400">
          Launch checklist
        </span>
        <span className="font-mono text-xs text-blue-400">12 cards</span>
      </div>
      <div className="grid sm:grid-cols-3 sm:divide-x sm:divide-neutral-800">
        {columns.map((column) => (
          <div key={column.name} className="p-5">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[11px] text-neutral-500">
                {column.name}
              </span>
              <span className="font-mono text-[11px] text-blue-400">
                {column.cards.length}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {column.cards.map((card) => (
                <CobaltMiniCard key={card.title} card={card} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ledger = [
  {
    tag: "sync",
    body: "Every drag, edit, and comment lands on every screen in the room instantly.",
  },
  {
    tag: "speed",
    body: "The board opens fast and stays fast, even on hardware nobody would call new.",
  },
  {
    tag: "invite",
    body: "One link brings the whole team in, signed in and ready to drag.",
  },
  {
    tag: "history",
    body: "Every move is recorded in plain sentences, not audit codes.",
  },
];

export default function LandingCobaltPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-neutral-100">
      <nav className="border-b border-neutral-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/design-variants" className="font-semibold">
            cardboards
          </Link>
          <div className="flex items-center gap-6">
            <a
              href="#keys"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Keyboard
            </a>
            <a
              href="#start"
              className="bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Get started
            </a>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pt-20 md:pt-24">
        <h1 className="text-6xl tracking-tighter md:text-8xl">
          <span className="font-extralight text-neutral-500">Precision,</span>
          <br />
          <span className="font-semibold">
            not <span className="text-blue-400">ceremony.</span>
          </span>
        </h1>
        <div className="mt-10 flex flex-col items-start justify-between gap-8 pb-16 md:flex-row md:items-end">
          <p className="max-w-sm leading-relaxed text-neutral-400">
            A fast kanban board with realtime sync and keyboard-first flow.
            Nothing else ships with it.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="#start"
              className="bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Get started
            </a>
            <a
              href="#keys"
              className="border border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-400"
            >
              See the keyboard flow
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <CobaltBoardPanel />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-3xl">
          {ledger.map((entry, index) => (
            <div
              key={entry.tag}
              className={`grid gap-2 py-6 sm:grid-cols-[8rem_1fr] ${
                index > 0 ? "border-t border-neutral-800" : ""
              }`}
            >
              <span className="font-mono text-sm text-blue-400">
                {entry.tag}
              </span>
              <p className="leading-relaxed text-neutral-300">{entry.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="keys" className="border-y border-neutral-800 bg-[#0d0e11]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Hands stay on the keys
            </h2>
            <p className="mt-4 max-w-sm leading-relaxed text-neutral-400">
              Everything on the board has a shortcut, and the shortcuts are
              the ones your fingers already guess.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            {[
              { key: "N", label: "New card" },
              { key: "/", label: "Search" },
              { key: "⌘K", label: "Jump to board" },
              { key: "E", label: "Edit card" },
            ].map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center gap-3 border border-neutral-800 px-4 py-3"
              >
                <kbd className="bg-neutral-900 px-2 py-1 font-mono text-sm text-blue-400">
                  {shortcut.key}
                </kbd>
                <span className="text-sm text-neutral-400">
                  {shortcut.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="start" className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              $6 per person, per month.
            </h2>
            <p className="mt-2 max-w-sm leading-relaxed text-neutral-500">
              Free while your team is three people or fewer.
            </p>
          </div>
          <a
            href="#start"
            className="bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            Get started
          </a>
        </div>
      </section>

      <footer className="border-t border-neutral-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-neutral-500">
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
