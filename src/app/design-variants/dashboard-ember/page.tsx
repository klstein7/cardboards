import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";

import {
  dashboardBoards,
  type MockPerson,
  recentActivity,
} from "../_lib/mock-data";

function EmberAvatar({ person }: { person: MockPerson }) {
  return (
    <span
      className="flex size-7 items-center justify-center rounded-full text-[10px] font-medium"
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

export default function DashboardEmberPage() {
  return (
    <div className="min-h-dvh bg-stone-950 text-stone-200">
      <header className="border-b border-stone-800/70">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link href="/design-variants" className="font-semibold text-stone-50">
            cardboards
          </Link>
          <div className="flex items-center gap-5">
            <a
              href="#"
              className="text-sm text-stone-400 transition-colors hover:text-stone-50"
            >
              Atlas rebuild
            </a>
            <span className="flex size-8 items-center justify-center rounded-full bg-stone-800 text-xs font-medium text-stone-300">
              KS
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24">
        <section className="pt-14">
          <h1 className="text-4xl font-medium tracking-tight text-stone-50">
            Good evening, Kyle.
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-stone-400">
            The team has <span className="text-amber-400">47</span> open
            cards, <span className="text-amber-400">6</span> due this week,
            and shipped <span className="text-amber-400">12</span> in the last
            seven days.
          </p>
        </section>

        <section className="mt-14">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-stone-500">Boards</h2>
            <button className="flex items-center gap-1.5 rounded-full bg-amber-400 px-4 py-1.5 text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-300">
              <IconPlus size={14} strokeWidth={2.5} />
              New board
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {dashboardBoards.map((board) => (
              <a
                key={board.name}
                href="#"
                className="flex items-center justify-between gap-4 rounded-3xl border border-stone-800 bg-stone-900/50 px-6 py-5 transition-colors hover:border-stone-700"
              >
                <div className="min-w-0">
                  <h3 className="font-medium text-stone-50">{board.name}</h3>
                  <p className="mt-1 text-sm text-stone-500">
                    {board.doneCount} of {board.cardCount} cards done
                  </p>
                  <div className="mt-2.5 h-1 w-40 overflow-hidden rounded-full bg-stone-800">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{
                        width: `${Math.round((board.doneCount / board.cardCount) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex shrink-0 -space-x-2">
                  {board.members.map((member) => (
                    <EmberAvatar key={member.initials} person={member} />
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-sm font-medium text-stone-500">
            While you were away
          </h2>
          <div className="mt-4">
            {recentActivity.map((item, index) => (
              <div
                key={index}
                className={`flex gap-3 py-4 ${
                  index > 0 ? "border-t border-stone-800/70" : ""
                }`}
              >
                <EmberAvatar person={item.person} />
                <div className="min-w-0">
                  <p className="text-sm leading-snug text-stone-300">
                    <span className="font-medium text-stone-50">
                      {item.person.name}
                    </span>{" "}
                    {item.action}
                  </p>
                  {item.target ? (
                    <p className="mt-0.5 truncate text-sm text-stone-500">
                      {item.target}
                    </p>
                  ) : null}
                </div>
                <span className="ml-auto shrink-0 text-xs text-stone-600">
                  {item.time} ago
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
