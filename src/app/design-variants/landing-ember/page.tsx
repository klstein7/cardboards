import Link from "next/link";

import {
  aisha,
  boardColumns,
  type MockCard,
  type MockPerson,
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

function EmberCard({
  card,
  className = "",
}: {
  card: MockCard;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-stone-800 bg-stone-900 p-4 ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-1.5 size-1.5 shrink-0 rounded-full ${priorityTint[card.priority]}`}
        />
        <p className="text-sm leading-snug text-stone-200">{card.title}</p>
      </div>
      <div className="mt-3 flex items-center justify-between pl-4">
        <span className="rounded-full bg-stone-800 px-2.5 py-0.5 text-[10px] font-medium text-stone-400">
          {card.label}
        </span>
        {card.assignee ? <EmberAvatar person={card.assignee} /> : null}
      </div>
    </div>
  );
}

function EmberHeroStack() {
  const cards = boardColumns[1]!.cards;
  return (
    <div className="relative mx-auto max-w-sm py-6">
      <EmberCard card={cards[1]!} className="-rotate-2 opacity-80" />
      <EmberCard
        card={cards[0]!}
        className="relative z-10 -mt-3 rotate-1  shadow-black/40"
      />
      <div className="relative z-20 -mt-2 ml-8 flex items-start gap-2.5 rounded-2xl border border-stone-800 bg-stone-900 p-3.5  shadow-black/40">
        <EmberAvatar person={aisha} />
        <p className="text-[13px] leading-relaxed text-stone-300">
          Confirmed on 17.4, fix is up for review.
        </p>
      </div>
    </div>
  );
}

function EmberWeekPreview() {
  const columns = boardColumns
    .slice(1, 3)
    .map((column) => ({ ...column, cards: column.cards.slice(0, 2) }));
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {columns.map((column) => (
        <div
          key={column.name}
          className="rounded-3xl border border-stone-800 bg-stone-900/50 p-4"
        >
          <div className="flex items-baseline justify-between px-2">
            <span className="text-sm font-medium text-stone-300">
              {column.name}
            </span>
            <span className="text-xs text-stone-500">
              {column.cards.length} cards
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {column.cards.map((card) => (
              <EmberCard key={card.title} card={card} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LandingEmberPage() {
  return (
    <main className="min-h-dvh bg-stone-950 text-stone-200">
      <nav className="border-b border-stone-800/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/design-variants" className="font-semibold text-stone-50">
            cardboards
          </Link>
          <div className="flex items-center gap-6">
            <a
              href="#pricing"
              className="text-sm text-stone-400 transition-colors hover:text-stone-50"
            >
              Pricing
            </a>
            <a
              href="#pricing"
              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-300"
            >
              Try it free
            </a>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-16 md:pt-20 lg:grid-cols-[6fr_5fr]">
        <div>
          <h1 className="text-5xl font-medium tracking-tight text-stone-50 md:text-6xl">
            Small team.
            <br />
            Big week.
            <br />
            <span className="text-amber-400">One board.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-stone-400">
            cardboards keeps the week visible: what is moving, what is stuck,
            and who could use a hand.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#pricing"
              className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-300"
            >
              Try it free
            </a>
            <a
              href="#week"
              className="rounded-full border border-stone-700 px-6 py-3 text-sm font-medium text-stone-300 transition-colors hover:border-stone-500"
            >
              See the week view
            </a>
          </div>
        </div>
        <EmberHeroStack />
      </section>

      <section id="week" className="border-t border-stone-800/70">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-[5fr_7fr]">
          <div>
            <h2 className="text-3xl font-medium tracking-tight text-stone-50 md:text-4xl">
              Monday morning in one glance
            </h2>
            <p className="mt-5 max-w-sm leading-relaxed text-stone-400">
              Open the board and the standup runs itself. What moved is
              obvious, what stalled is louder.
            </p>
          </div>
          <EmberWeekPreview />
        </div>
      </section>

      <section className="border-t border-stone-800/70">
        <div className="mx-auto max-w-3xl px-6 py-28 text-center">
          <p className="text-3xl font-light leading-snug text-stone-100 md:text-4xl">
            &ldquo;It feels less like project software and more like a tidy
            desk.&rdquo;
          </p>
          <p className="mt-6 text-sm text-stone-500">
            Nadia Ferreira, studio lead at Hollowell &amp; Co
          </p>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl border border-stone-800 bg-stone-900/60 px-8 py-14 text-center md:px-16">
          <p className="text-5xl font-medium tracking-tight text-stone-50 md:text-6xl">
            <span className="text-amber-400">$6</span> per person
          </p>
          <p className="mx-auto mt-4 max-w-sm leading-relaxed text-stone-400">
            Per month, with every feature included. Free while your team is
            three or fewer.
          </p>
          <a
            href="#pricing"
            className="mt-8 inline-block rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-300"
          >
            Try it free
          </a>
        </div>
      </section>

      <footer className="border-t border-stone-800/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-stone-500">
          <span>cardboards</span>
          <Link
            href="/design-variants"
            className="transition-colors hover:text-stone-50"
          >
            All variants
          </Link>
        </div>
      </footer>
    </main>
  );
}
