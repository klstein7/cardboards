import Link from "next/link";

import { boardColumns, type MockCard } from "../_lib/mock-data";

const priorityEdge: Record<string, string> = {
  urgent: "border-l-red-500",
  high: "border-l-neutral-200",
  medium: "border-l-fuchsia-400",
  low: "border-l-neutral-700",
};

function OrchidMiniCard({ card }: { card: MockCard }) {
  return (
    <div
      className={`rounded-sm border-l-2 bg-[#161217] p-3 ${priorityEdge[card.priority]}`}
    >
      <p className="text-[13px] leading-snug text-neutral-300">{card.title}</p>
      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-neutral-600">
        <span>{card.label}</span>
        {card.assignee ? <span>{card.assignee.initials}</span> : null}
      </div>
    </div>
  );
}

const statements = [
  {
    lead: "Quiet by design.",
    rest: "No badges begging for attention, no feed to fall behind on.",
  },
  {
    lead: "Everything is a card.",
    rest: "Work, decisions, and conversations live in one shape.",
  },
  {
    lead: "Leave and come back.",
    rest: "The board reads the same after lunch or after a week away.",
  },
];

export default function LandingOrchidPage() {
  const previewColumns = boardColumns
    .slice(1, 3)
    .map((column) => ({ ...column, cards: column.cards.slice(0, 2) }));

  return (
    <main className="min-h-dvh bg-neutral-950 text-neutral-100">
      <nav className="border-b border-neutral-800">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
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
              className="rounded-sm bg-fuchsia-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-fuchsia-300"
            >
              Start free
            </a>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-3xl px-6 pt-20 text-center md:pt-24">
        <h1 className="text-5xl font-light tracking-tight md:text-7xl">
          The calmest view
          <br />
          of a <span className="font-semibold text-fuchsia-400">
            busy week.
          </span>
        </h1>
        <p className="mx-auto mt-8 max-w-md leading-relaxed text-neutral-400">
          One board, a few columns, your whole team. cardboards stays quiet so
          the work can be loud.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <a
            href="#pricing"
            className="rounded-sm bg-fuchsia-400 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-fuchsia-300"
          >
            Start free
          </a>
          <a
            href="#board"
            className="rounded-sm border border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-400"
          >
            See the board
          </a>
        </div>
      </section>

      <section id="board" className="mx-auto max-w-3xl px-6 pt-24">
        <div className="grid gap-6 rounded-sm border border-neutral-800 p-6 sm:grid-cols-2">
          {previewColumns.map((column) => (
            <div key={column.name}>
              <div className="flex items-baseline justify-between px-0.5">
                <span className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                  {column.name}
                </span>
                <span className="font-mono text-[11px] text-fuchsia-400">
                  {column.cards.length}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {column.cards.map((card) => (
                  <OrchidMiniCard key={card.title} card={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-28">
        {statements.map((statement) => (
          <p
            key={statement.lead}
            className="py-6 text-2xl font-light leading-relaxed text-neutral-500"
          >
            <span className="font-medium text-neutral-100">
              {statement.lead}
            </span>{" "}
            {statement.rest}
          </p>
        ))}
      </section>

      <section className="border-y border-neutral-800">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="text-2xl font-light leading-relaxed text-neutral-200 md:text-3xl">
            &ldquo;Opening it feels like exhaling. Everything is where we left
            it.&rdquo;
          </p>
          <p className="mt-6 text-sm text-neutral-500">
            Sanne Bakker, design director at Loomfield
          </p>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-4xl font-light tracking-tight md:text-5xl">
          <span className="font-semibold text-fuchsia-400">$6</span> per
          person, per month.
        </p>
        <p className="mx-auto mt-4 max-w-sm leading-relaxed text-neutral-500">
          Free while your team is three or fewer. Every feature on every plan.
        </p>
        <a
          href="#pricing"
          className="mt-8 inline-block rounded-sm bg-fuchsia-400 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-fuchsia-300"
        >
          Start free
        </a>
      </section>

      <footer className="border-t border-neutral-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8 text-sm text-neutral-500">
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
