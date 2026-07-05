import Link from "next/link";

import { boardColumns, type MockCard } from "../_lib/mock-data";

const priorityEdge: Record<string, string> = {
  urgent: "border-l-red-500",
  high: "border-l-neutral-200",
  medium: "border-l-neutral-500",
  low: "border-l-neutral-700",
};

function AcidMiniCard({ card }: { card: MockCard }) {
  return (
    <div
      className={`border-l-2 bg-[#141414] p-3 ${priorityEdge[card.priority]}`}
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

function AcidBoardPanel() {
  const columns = boardColumns
    .slice(0, 3)
    .map((column) => ({ ...column, cards: column.cards.slice(0, 3) }));
  const cardCount = columns.reduce(
    (total, column) => total + column.cards.length,
    0,
  );
  return (
    <div className="border border-neutral-800">
      <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3">
        <span className="text-sm font-medium text-neutral-200">
          Launch checklist
        </span>
        <span className="flex items-center gap-4 font-mono text-[11px] text-neutral-500">
          <span className="hidden sm:inline">MH TR AK DO YT</span>
          <span className="text-lime-300">{cardCount} cards</span>
        </span>
      </div>
      <div className="grid sm:grid-cols-3 sm:divide-x sm:divide-neutral-800">
        {columns.map((column) => (
          <div key={column.name} className="p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                {column.name}
              </span>
              <span className="font-mono text-[11px] text-lime-300">
                {column.cards.length}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {column.cards.map((card) => (
                <AcidMiniCard key={card.title} card={card} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingAcidPage() {
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
              className="bg-lime-300 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-lime-200"
            >
              Get started
            </a>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pt-20 md:pt-24">
        <h1 className="text-6xl font-semibold tracking-tighter md:text-8xl">
          <span className="block leading-none">Less process.</span>
          <span className="mt-4 inline-block bg-lime-300 px-4 pb-2 pt-1 leading-none text-neutral-950">
            More done.
          </span>
        </h1>
        <div className="mt-10 flex flex-col items-start justify-between gap-8 pb-16 md:flex-row md:items-end">
          <p className="max-w-md text-lg leading-relaxed text-neutral-400">
            cardboards is a kanban board that refuses to become a process.
            Columns, cards, comments.
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
      </section>

      <section id="work" className="mx-auto max-w-6xl px-6">
        <AcidBoardPanel />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Everything it does.
        </h2>
        <div className="mt-8 grid gap-px bg-neutral-800 md:grid-cols-3">
          <div className="bg-neutral-950 p-8 md:col-span-2">
            <h3 className="text-xl font-semibold tracking-tight">
              Realtime sync
            </h3>
            <p className="mt-2 max-w-sm leading-relaxed text-neutral-400">
              Every drag lands on every screen the moment it happens. The
              board is the standup.
            </p>
            <div className="mt-6 grid max-w-lg gap-2 sm:grid-cols-2">
              <AcidMiniCard card={boardColumns[1]!.cards[0]!} />
              <AcidMiniCard card={boardColumns[1]!.cards[2]!} />
            </div>
          </div>
          <div className="bg-neutral-950 p-8">
            <h3 className="text-xl font-semibold tracking-tight">
              Keyboard flow
            </h3>
            <p className="mt-2 leading-relaxed text-neutral-400">
              New card, search, jump to board. Hands stay on the keys.
            </p>
            <div className="mt-6 flex gap-2">
              {["N", "/", "⌘K"].map((key) => (
                <kbd
                  key={key}
                  className="border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 font-mono text-sm text-lime-300"
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
          <div className="bg-neutral-950 p-8">
            <h3 className="text-xl font-semibold tracking-tight">
              One-link invites
            </h3>
            <p className="mt-2 leading-relaxed text-neutral-400">
              Share a link and the whole team is on the board.
            </p>
            <p className="mt-6 inline-block border border-neutral-800 px-3 py-2 font-mono text-xs text-neutral-500">
              cardboards.app/i/new-team
            </p>
          </div>
          <div className="bg-lime-300 p-8 text-neutral-950 md:col-span-2">
            <h3 className="text-xl font-semibold tracking-tight">No setup</h3>
            <p className="mt-2 max-w-md leading-relaxed text-neutral-800">
              Name three columns and you are running. No workflow builder, no
              onboarding call, no step two.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <blockquote className="max-w-2xl">
            <p className="text-2xl font-medium leading-snug text-neutral-100 md:text-3xl">
              &ldquo;It is the first tool we adopted that nobody had to be
              trained on.&rdquo;
            </p>
            <footer className="mt-5 text-sm text-neutral-500">
              Imogen Vance, product lead at Redpoll Studio
            </footer>
          </blockquote>
        </div>
      </section>

      <section id="free" className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <p className="text-8xl font-semibold tracking-tighter md:text-9xl">
            Free.
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
                className="inline-block bg-lime-300 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-lime-200"
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
