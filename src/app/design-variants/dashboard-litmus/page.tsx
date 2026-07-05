import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";

import {
  dashboardBoards,
  dashboardStats,
  recentActivity,
} from "../_lib/mock-data";

const topNav = [
  { label: "Boards", active: true },
  { label: "Members", active: false },
  { label: "Activity", active: false },
  { label: "Settings", active: false },
];

export default function DashboardLitmusPage() {
  return (
    <div className="min-h-dvh bg-neutral-100 text-neutral-900">
      <header className="border-b border-neutral-300">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/design-variants" className="font-semibold text-neutral-950">
            cardboards
          </Link>
          <nav className="hidden items-center gap-5 md:flex">
            {topNav.map((item) => (
              <a
                key={item.label}
                href="#"
                className={`text-sm transition-colors ${
                  item.active
                    ? "bg-lime-300 px-2.5 py-1 font-medium text-neutral-950"
                    : "text-neutral-500 hover:text-neutral-950"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <span className="flex size-8 items-center justify-center bg-neutral-950 font-mono text-xs text-lime-300">
            KS
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex flex-wrap items-end justify-between gap-6 pt-14">
          <div>
            <p className="text-sm text-neutral-500">Project</p>
            <h1 className="mt-1 text-5xl font-extralight tracking-tight text-neutral-950 md:text-6xl">
              Atlas rebuild
            </h1>
          </div>
          <button className="flex items-center gap-1.5 bg-neutral-950 px-4 py-2 text-sm font-semibold text-lime-300 transition-colors hover:bg-neutral-800">
            <IconPlus size={15} strokeWidth={2} />
            New board
          </button>
        </div>

        <div className="mt-14 grid grid-cols-2 border-y border-neutral-300 md:grid-cols-4 md:divide-x md:divide-neutral-300">
          {dashboardStats.map((stat, index) => (
            <div key={stat.label} className="py-8 md:px-8 md:first:pl-0">
              <p className="text-sm text-neutral-500">{stat.label}</p>
              <p className="mt-2 text-5xl font-extralight tracking-tight text-neutral-950 md:text-6xl">
                {index === 3 ? (
                  <span className="inline-block bg-lime-300 px-2">
                    {stat.value}
                  </span>
                ) : (
                  stat.value
                )}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-16">
          <h2 className="text-sm text-neutral-500">Boards</h2>
          <div className="mt-2">
            {dashboardBoards.map((board) => (
              <a
                key={board.name}
                href="#"
                className="group flex flex-wrap items-baseline justify-between gap-3 border-t border-neutral-300 py-6 first:border-t-0"
              >
                <h3 className="flex items-baseline gap-4 text-2xl font-light tracking-tight text-neutral-950 decoration-lime-300 decoration-4 underline-offset-8 group-hover:underline md:text-3xl">
                  <span
                    className="size-2.5 shrink-0 self-center"
                    style={{ backgroundColor: `hsl(${board.hue} 55% 45%)` }}
                  />
                  {board.name}
                </h3>
                <div className="flex items-baseline gap-6 font-mono text-sm text-neutral-500">
                  <span>
                    {board.doneCount}/{board.cardCount} done
                  </span>
                  <span className="hidden sm:inline">
                    {board.members.map((member) => member.initials).join(" ")}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-16 max-w-2xl">
          <h2 className="text-sm text-neutral-500">Activity</h2>
          <div className="mt-4 space-y-4">
            {recentActivity.map((item, index) => (
              <div key={index} className="flex items-baseline gap-4">
                <p className="min-w-0 text-sm leading-relaxed text-neutral-600">
                  <span className="text-neutral-950">{item.person.name}</span>{" "}
                  {item.action}
                  {item.target ? (
                    <span className="text-neutral-500"> {item.target}</span>
                  ) : null}
                </p>
                <span className="ml-auto shrink-0 font-mono text-xs text-neutral-400">
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
