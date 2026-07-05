import Link from "next/link";

import { boardColumns, type MockCard } from "../_lib/mock-data";

const priorityEdge: Record<string, string> = {
  urgent: "border-l-red-500",
  high: "border-l-neutral-200",
  medium: "border-l-neutral-500",
  low: "border-l-neutral-700",
};

function VoltMiniCard({ card }: { card: MockCard }) {
  return (
    <div
      className={`border border-neutral-800 border-l-2 p-3 ${priorityEdge[card.priority]}`}
    >
      <p className="text-[13px] leading-snug text-neutral-300">{card.title}</p>
      <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-neutral-600">
        <span>{card.label}</span>
        {card.due ? (
          <span className={card.overdue ? "text-red-500" : "text-neutral-500"}>
            {card.due}
          </span>
        ) : null}
        {card.assignee ? (
          <span className="ml-auto text-neutral-500">
            {card.assignee.initials}
          </span>
        ) : null}
      </div>
    </div>
  );
}

const ledger = [
  {
    title: "Realtime sync",
    body: "Every drag lands on every screen the moment it happens. The board is the standup.",
  },
  {
    title: "Keyboard flow",
    body: "New card, search, jump to board. Hands stay on the keys.",
  },
  {
    title: "One-link invites",
    body: "Share a link and the whole team is on the board.",
  },
  {
    title: "No setup",
    body: "Name three columns and you are running. No workflow builder, no step two.",
  },
];

export default function LandingVoltPage() {
  const previewColumns = boardColumns
    .slice(1, 3)
    .map((column) => ({ ...column, cards: column.cards.slice(0, 3) }));

  return (
    <main className="min-h-dvh bg-neutral-950 text-neutral-100">
      <nav className="border-b border-neutral-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/design-variants" className="font-semibold">
            cardboards
          </Link>
          <div className="flex items-center gap-6">
            <a
              href="#free"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              GitHub
            </a>
            <a
              href="#free"
              className="border border-lime-300 px-4 py-2 text-sm font-semibold text-lime-300 transition-colors hover:bg-lime-300 hover:text-neutral-950"
            >
              Get started
            </a>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pt-20 md:pt-24">
        <h1 className="text-5xl font-semibold tracking-tighter md:text-7xl">
          <span className="block leading-tight">The shortest line</span>
          <span className="block leading-tight">
            from idea to{" "}
            <span className="inline-block border-b-4 border-lime-300 pb-1 md:border-b-8">
              done.
            </span>
          </span>
        </h1>
        <div className="mt-10 flex flex-col items-start justify-between gap-8 pb-16 md:flex-row md:items-end">
          <p className="max-w-md text-lg leading-relaxed text-neutral-400">
            No workflow engine, no ceremony. cardboards is a board that moves
            at typing speed.
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <a
              href="#free"
              className="bg-lime-300 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-lime-200"
            >
              Get started
            </a>
            <a
              href="#work"
              className="border border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-400"
            >
              See the board
            </a>
          </div>
        </div>
        <div className="h-0.5 w-full bg-lime-300" />
      </section>

      <section id="work" className="mx-auto max-w-6xl px-6 pt-16">
        <div className="grid gap-8 sm:grid-cols-2">
          {previewColumns.map((column) => (
            <div key={column.name}>
              <div className="flex items-baseline justify-between border-b border-neutral-800 px-0.5 pb-3">
                <span className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                  {column.name}
                </span>
                <span className="font-mono text-[11px] text-lime-300">
                  {column.cards.length}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                {column.cards.map((card) => (
                  <VoltMiniCard key={card.title} card={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Everything it does.
        </h2>
        <div className="mt-8">
          {ledger.map((item) => (
            <div
              key={item.title}
              className="group grid gap-2 border-t border-neutral-800 py-7 last:border-b md:grid-cols-[1fr_2fr] md:gap-10"
            >
              <h3 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-lime-300">
                {item.title}
              </h3>
              <p className="max-w-lg leading-relaxed text-neutral-400">
                {item.body}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex gap-2">
          {["N", "/", "⌘K"].map((key) => (
            <kbd
              key={key}
              className="border border-neutral-800 px-2.5 py-1.5 font-mono text-sm text-lime-300"
            >
              {key}
            </kbd>
          ))}
        </div>
      </section>

      <section className="border-y border-neutral-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <blockquote className="max-w-2xl">
            <p className="text-2xl font-medium leading-snug text-neutral-100 md:text-3xl">
              &ldquo;Cards go up during the meeting, not after it. That alone
              changed how we plan.&rdquo;
            </p>
            <footer className="mt-5 text-sm text-neutral-500">
              Nils Devereux, founder at Halfpipe Systems
            </footer>
          </blockquote>
        </div>
      </section>

      <section id="free" className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <p className="text-8xl font-semibold tracking-tighter md:text-9xl">
            <span className="inline-block border-b-8 border-lime-300 pb-2">
              Free.
            </span>
          </p>
          <div className="md:justify-self-end">
            <p className="text-xl text-neutral-200">
              Open source, MIT licensed.
            </p>
            <p className="mt-2 max-w-xs leading-relaxed text-neutral-500">
              Run it on your own hardware or use the hosted app. Same board
              either way, no paid tier hiding features.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#free"
                className="inline-block border border-lime-300 px-5 py-2.5 text-sm font-semibold text-lime-300 transition-colors hover:bg-lime-300 hover:text-neutral-950"
              >
                Get started
              </a>
              <a
                href="#free"
                className="inline-block border border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-400"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-neutral-500">
          <span>
            cardboards <span className="text-neutral-700">MIT licensed</span>
          </span>
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
