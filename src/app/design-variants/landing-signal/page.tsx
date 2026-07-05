import Link from "next/link";

import { boardColumns, type MockCard } from "../_lib/mock-data";

const priorityEdge: Record<string, string> = {
  urgent: "border-l-red-500",
  high: "border-l-neutral-200",
  medium: "border-l-neutral-500",
  low: "border-l-neutral-700",
};

function SignalMiniCard({ card }: { card: MockCard }) {
  return (
    <div
      className={`border-l-2 bg-neutral-900 p-3 ${priorityEdge[card.priority]}`}
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

const statements = [
  {
    title: "Realtime sync",
    body: "Every drag lands on every screen the moment it happens. The board is the standup.",
  },
  {
    title: "Keyboard flow",
    body: "New card, search, jump to board. Hands stay on the keys.",
    chips: ["N", "/", "⌘K"],
  },
  {
    title: "No setup",
    body: "Name three columns and you are running. No workflow builder, no onboarding call, no step two.",
  },
];

export default function LandingSignalPage() {
  const previewColumns = boardColumns
    .slice(1, 3)
    .map((column) => ({ ...column, cards: column.cards.slice(0, 3) }));

  return (
    <main className="min-h-dvh bg-neutral-950 text-neutral-100">
      <div className="bg-lime-300 text-neutral-950">
        <nav className="border-b border-neutral-950/20">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <Link href="/design-variants" className="font-semibold">
              cardboards
            </Link>
            <div className="flex items-center gap-6">
              <a
                href="#free"
                className="text-sm text-neutral-800 transition-colors hover:text-neutral-950"
              >
                GitHub
              </a>
              <a
                href="#free"
                className="bg-neutral-950 px-4 py-2 text-sm font-semibold text-lime-300 transition-colors hover:bg-neutral-800"
              >
                Get started
              </a>
            </div>
          </div>
        </nav>

        <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:pt-20">
          <h1 className="text-6xl font-bold uppercase tracking-tighter md:text-9xl">
            <span className="block leading-none">All signal.</span>
            <span className="block leading-none">No process.</span>
          </h1>
          <div className="mt-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <p className="max-w-md text-lg leading-relaxed text-neutral-800">
              A kanban board that shows the work and skips the ceremony.
            </p>
            <div className="flex shrink-0 items-center gap-3">
              <a
                href="#free"
                className="bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-lime-300 transition-colors hover:bg-neutral-800"
              >
                Get started
              </a>
              <a
                href="#work"
                className="border border-neutral-950 px-5 py-2.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-neutral-950/10"
              >
                See the board
              </a>
            </div>
          </div>
        </section>
      </div>

      <section id="work" className="mx-auto max-w-6xl px-6 pt-16">
        <div className="border border-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3">
            <span className="text-sm font-medium text-neutral-200">
              Launch checklist
            </span>
            <span className="font-mono text-[11px] text-lime-300">
              live for everyone
            </span>
          </div>
          <div className="grid sm:grid-cols-2 sm:divide-x sm:divide-neutral-800">
            {previewColumns.map((column) => (
              <div key={column.name} className="p-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                    {column.name}
                  </span>
                  <span className="bg-lime-300 px-1.5 font-mono text-[11px] text-neutral-950">
                    {column.cards.length}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  {column.cards.map((card) => (
                    <SignalMiniCard key={card.title} card={card} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        {statements.map((statement) => (
          <div
            key={statement.title}
            className="flex flex-col gap-4 border-t border-neutral-800 py-10 last:border-b md:flex-row md:items-baseline md:justify-between"
          >
            <h2 className="text-3xl font-bold uppercase tracking-tight md:text-4xl">
              {statement.title}
            </h2>
            <div className="md:max-w-md">
              <p className="leading-relaxed text-neutral-400">
                {statement.body}
              </p>
              {statement.chips ? (
                <div className="mt-4 flex gap-2">
                  {statement.chips.map((key) => (
                    <kbd
                      key={key}
                      className="bg-lime-300 px-2.5 py-1.5 font-mono text-sm font-semibold text-neutral-950"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <blockquote className="max-w-2xl">
          <p className="text-2xl font-medium leading-snug text-neutral-100 md:text-3xl">
            &ldquo;You can see the whole sprint from across the room. Nothing
            else we tried could do that.&rdquo;
          </p>
          <footer className="mt-5 text-sm text-neutral-500">
            Rocio Ferrant, design director at Ledgerline
          </footer>
        </blockquote>
      </section>

      <section id="free" className="bg-lime-300 text-neutral-950">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <p className="text-7xl font-bold uppercase tracking-tighter md:text-9xl">
              Free.
            </p>
            <div className="md:justify-self-end">
              <p className="text-xl font-medium">Open source, MIT licensed.</p>
              <p className="mt-2 max-w-xs leading-relaxed text-neutral-800">
                Run it on your own hardware or use the hosted app. Same board
                either way, no paid tier hiding features.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <a
                  href="#free"
                  className="inline-block bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-lime-300 transition-colors hover:bg-neutral-800"
                >
                  Get started
                </a>
                <a
                  href="#free"
                  className="inline-block border border-neutral-950 px-5 py-2.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-neutral-950/10"
                >
                  View on GitHub
                </a>
              </div>
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
