import { IconCheck } from "@tabler/icons-react";
import Link from "next/link";

import { boardColumns, type MockCard } from "../_lib/mock-data";

const priorityEdge: Record<string, string> = {
  urgent: "border-l-red-600",
  high: "border-l-neutral-900",
  medium: "border-l-neutral-400",
  low: "border-l-neutral-200",
};

function LitmusMiniCard({ card }: { card: MockCard }) {
  return (
    <div
      className={`border border-neutral-200 border-l-2 bg-white p-3 ${priorityEdge[card.priority]}`}
    >
      <p className="text-[13px] leading-snug text-neutral-800">{card.title}</p>
      <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-neutral-400">
        <span>{card.label}</span>
        {card.due ? (
          <span className={card.overdue ? "text-red-600" : "text-neutral-500"}>
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

const checklist = [
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

export default function LandingLitmusPage() {
  const previewColumn = {
    ...boardColumns[1]!,
    cards: boardColumns[1]!.cards.slice(0, 3),
  };

  return (
    <main className="min-h-dvh bg-neutral-100 text-neutral-900">
      <nav className="border-b border-neutral-300">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/design-variants" className="font-semibold text-neutral-950">
            cardboards
          </Link>
          <div className="flex items-center gap-6">
            <a
              href="#free"
              className="text-sm text-neutral-500 transition-colors hover:text-neutral-950"
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

      <section className="mx-auto max-w-6xl px-6 pt-20 md:pt-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="text-5xl font-semibold tracking-tighter text-neutral-950 md:text-7xl">
              Work you can{" "}
              <span className="inline-block bg-lime-300 px-3 pb-1">read.</span>
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-neutral-600">
              cardboards keeps a project as plain as a printed page. Columns,
              cards, comments. Nothing else.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <a
                href="#free"
                className="bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-lime-300 transition-colors hover:bg-neutral-800"
              >
                Get started
              </a>
              <a
                href="#work"
                className="border border-neutral-400 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-950 hover:text-neutral-950"
              >
                See the board
              </a>
            </div>
          </div>
          <div id="work" className="border border-neutral-300 bg-neutral-50">
            <div className="flex items-baseline justify-between border-b border-neutral-300 px-5 py-3">
              <span className="text-sm font-medium text-neutral-950">
                Launch checklist
              </span>
              <span className="font-mono text-[11px] text-neutral-500">
                {previewColumn.name}
              </span>
            </div>
            <div className="space-y-2 p-5">
              {previewColumn.cards.map((card) => (
                <LitmusMiniCard key={card.title} card={card} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 md:text-4xl">
          Everything it does.
        </h2>
        <div className="mt-10 grid gap-x-16 gap-y-10 md:grid-cols-2">
          {checklist.map((item) => (
            <div key={item.title} className="flex gap-4">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center bg-lime-300">
                <IconCheck size={14} strokeWidth={2.5} className="text-neutral-950" />
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-neutral-950">
                  {item.title}
                </h3>
                <p className="mt-1 max-w-sm leading-relaxed text-neutral-600">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-neutral-300 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <blockquote className="max-w-2xl">
            <p className="text-2xl font-medium leading-snug text-neutral-900 md:text-3xl">
              &ldquo;Our whole plan fits on one screen now, and everyone
              actually looks at it.&rdquo;
            </p>
            <footer className="mt-5 text-sm text-neutral-500">
              Petra Lindqvist, engineering manager at Cobble &amp; Frame
            </footer>
          </blockquote>
        </div>
      </section>

      <section id="free" className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <p className="text-8xl font-semibold tracking-tighter text-neutral-950 md:text-9xl">
            <span className="inline-block bg-lime-300 px-4 pb-2">Free.</span>
          </p>
          <div className="md:justify-self-end">
            <p className="text-xl text-neutral-900">Open source, MIT licensed.</p>
            <p className="mt-2 max-w-xs leading-relaxed text-neutral-500">
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
                className="inline-block border border-neutral-400 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-950 hover:text-neutral-950"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-300">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-neutral-500">
          <span>
            cardboards <span className="text-neutral-400">MIT licensed</span>
          </span>
          <Link
            href="/design-variants"
            className="transition-colors hover:text-neutral-950"
          >
            All variants
          </Link>
        </div>
      </footer>
    </main>
  );
}
