import Link from "next/link";

import {
  boardColumns,
  type MockCard,
} from "../_lib/mock-data";

const priorityEdge: Record<string, string> = {
  urgent: "border-l-red-500",
  high: "border-l-neutral-200",
  medium: "border-l-neutral-500",
  low: "border-l-neutral-700",
};

function MonoMiniCard({ card }: { card: MockCard }) {
  return (
    <div
      className={`border-l-2 bg-[#141414] p-3 ${priorityEdge[card.priority]}`}
    >
      <p className="text-[13px] leading-snug text-neutral-300">{card.title}</p>
      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-neutral-600">
        <span>{card.label}</span>
        {card.assignee ? <span>{card.assignee.initials}</span> : null}
      </div>
    </div>
  );
}

function MonoBoardPreview() {
  const columns = boardColumns
    .slice(0, 3)
    .map((column) => ({ ...column, cards: column.cards.slice(0, 3) }));
  return (
    <div className="grid border-y border-neutral-800 sm:grid-cols-3 sm:divide-x sm:divide-neutral-800">
      {columns.map((column) => (
        <div key={column.name} className="p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
              {column.name}
            </span>
            <span className="font-mono text-[11px] text-neutral-600">
              {column.cards.length}
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {column.cards.map((card) => (
              <MonoMiniCard key={card.title} card={card} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const rows = [
  {
    word: "Boards.",
    detail: "Columns you name yourself. No workflow engine underneath.",
  },
  {
    word: "Cards.",
    detail: "A title, an owner, a due date. Open one for the full story.",
  },
  {
    word: "Comments.",
    detail: "Decisions stay attached to the work they decided.",
  },
];

export default function LandingMonoPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-neutral-100">
      <nav className="border-b border-neutral-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/design-variants" className="font-semibold">
            cardboards
          </Link>
          <div className="flex items-center gap-6">
            <a
              href="#pricing"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Pricing
            </a>
            <a
              href="#pricing"
              className="bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition-colors hover:bg-neutral-300"
            >
              Start free
            </a>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pt-20 md:pt-24">
        <h1 className="text-6xl tracking-tighter md:text-8xl">
          <span className="font-extralight text-neutral-500">The board</span>
          <br />
          <span className="font-semibold">is the plan.</span>
        </h1>
        <div className="mt-10 flex flex-col items-start justify-between gap-8 pb-16 md:flex-row md:items-end">
          <p className="max-w-sm leading-relaxed text-neutral-400">
            Drag cards, leave comments, ship. cardboards is kanban with
            nothing else attached.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="#pricing"
              className="bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-neutral-300"
            >
              Start free
            </a>
            <a
              href="#work"
              className="border border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-400"
            >
              See the board
            </a>
          </div>
        </div>
      </section>

      <section id="work" className="mx-auto max-w-6xl px-6">
        <MonoBoardPreview />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        {rows.map((row, index) => (
          <div
            key={row.word}
            className={`grid items-end gap-4 py-8 md:grid-cols-2 ${
              index > 0 ? "border-t border-neutral-800" : ""
            }`}
          >
            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
              {row.word}
            </h2>
            <p className="max-w-sm leading-relaxed text-neutral-400 md:justify-self-end md:text-right">
              {row.detail}
            </p>
          </div>
        ))}
      </section>

      <section
        id="pricing"
        className="border-y border-neutral-800 bg-[#0d0d0d]"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-[1fr_1fr]">
          <p className="text-8xl font-semibold tracking-tighter md:text-9xl">
            $6
          </p>
          <div className="md:justify-self-end">
            <p className="text-xl text-neutral-200">per person, per month.</p>
            <p className="mt-2 max-w-xs leading-relaxed text-neutral-500">
              Free while your team is three people or fewer. Every feature on
              every plan.
            </p>
            <a
              href="#pricing"
              className="mt-6 inline-block bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-neutral-300"
            >
              Start free
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <blockquote className="max-w-lg border-l border-neutral-700 pl-6">
          <p className="text-lg leading-relaxed text-neutral-300">
            &ldquo;We deleted our project tool and kept this. Nobody has asked
            for the old one back.&rdquo;
          </p>
          <footer className="mt-4 text-sm text-neutral-500">
            Jonas Whitfield, cofounder of Larkspur Systems
          </footer>
        </blockquote>
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
