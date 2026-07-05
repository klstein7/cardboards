import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";

import { dashboardBoards, recentActivity } from "../_lib/mock-data";

export default function DashboardOrchidPage() {
  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link href="/design-variants" className="font-semibold">
            cardboards
          </Link>
          <div className="flex items-center gap-5">
            <a
              href="#"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Atlas rebuild
            </a>
            <span className="flex size-8 items-center justify-center rounded-sm bg-neutral-800 font-mono text-xs text-neutral-300">
              KS
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24">
        <section className="pt-16">
          <h1 className="text-4xl font-light tracking-tight md:text-5xl">
            Good evening, Kyle.
          </h1>
          <p className="mt-5 max-w-lg text-lg font-light leading-relaxed text-neutral-400">
            The team has{" "}
            <span className="font-medium text-fuchsia-400">47</span> open
            cards, <span className="font-medium text-fuchsia-400">6</span> due
            this week, and shipped{" "}
            <span className="font-medium text-fuchsia-400">12</span> in the
            last seven days.
          </p>
        </section>

        <section className="mt-16">
          <div className="flex items-center justify-between">
            <h2 className="text-sm text-neutral-500">Boards</h2>
            <button className="flex items-center gap-1.5 rounded-sm bg-fuchsia-400 px-3.5 py-1.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-fuchsia-300">
              <IconPlus size={14} strokeWidth={2} />
              New board
            </button>
          </div>
          <div className="mt-3">
            {dashboardBoards.map((board) => (
              <a
                key={board.name}
                href="#"
                className="group flex flex-wrap items-baseline justify-between gap-3 border-t border-neutral-800 py-6"
              >
                <span className="flex items-center gap-3">
                  <span
                    className="size-2 rounded-sm"
                    style={{ backgroundColor: `hsl(${board.hue} 55% 62%)` }}
                  />
                  <span className="text-xl font-light tracking-tight transition-colors group-hover:text-fuchsia-300">
                    {board.name}
                  </span>
                </span>
                <span className="font-mono text-sm text-neutral-500">
                  {board.doneCount}/{board.cardCount} done{" "}
                  <span className="text-fuchsia-400">
                    {Math.round((board.doneCount / board.cardCount) * 100)}%
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-sm text-neutral-500">While you were away</h2>
          <div className="mt-4 space-y-5">
            {recentActivity.map((item, index) => (
              <div key={index} className="flex items-baseline gap-4">
                <p className="min-w-0 text-sm font-light leading-relaxed text-neutral-400">
                  <span className="font-normal text-neutral-100">
                    {item.person.name}
                  </span>{" "}
                  {item.action}
                  {item.target ? (
                    <span className="text-neutral-500"> {item.target}</span>
                  ) : null}
                </p>
                <span className="ml-auto shrink-0 font-mono text-xs text-neutral-600">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
