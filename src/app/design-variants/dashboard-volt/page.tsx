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

export default function DashboardVoltPage() {
  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/design-variants" className="font-semibold">
            cardboards
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {topNav.map((item) => (
              <a
                key={item.label}
                href="#"
                className={`border-b-2 pb-0.5 text-sm transition-colors ${
                  item.active
                    ? "border-lime-300 text-white"
                    : "border-transparent text-neutral-500 hover:text-neutral-200"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <span className="flex size-8 items-center justify-center border border-neutral-700 font-mono text-xs text-neutral-300">
            KS
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex flex-wrap items-end justify-between gap-6 pt-14">
          <div>
            <p className="text-sm text-neutral-500">Project</p>
            <h1 className="mt-1 text-5xl font-extralight tracking-tight md:text-6xl">
              Atlas rebuild
            </h1>
          </div>
          <button className="flex items-center gap-1.5 border border-lime-300 px-4 py-2 text-sm font-semibold text-lime-300 transition-colors hover:bg-lime-300 hover:text-neutral-950">
            <IconPlus size={15} strokeWidth={2} />
            New board
          </button>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
          {dashboardStats.map((stat, index) => (
            <div
              key={stat.label}
              className={`border-t-2 pt-6 ${
                index === 3 ? "border-lime-300" : "border-neutral-800"
              }`}
            >
              <p className="text-sm text-neutral-500">{stat.label}</p>
              <p
                className={`mt-2 text-5xl font-extralight tracking-tight md:text-6xl ${
                  index === 3 ? "text-lime-300" : ""
                }`}
              >
                {stat.value}
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
                className="group flex flex-wrap items-baseline justify-between gap-3 border-t border-neutral-800 py-6 first:border-t-0"
              >
                <h3 className="flex items-baseline gap-4 text-2xl font-light tracking-tight decoration-lime-300 decoration-2 underline-offset-8 group-hover:underline md:text-3xl">
                  <span
                    className="size-2.5 shrink-0 self-center"
                    style={{ backgroundColor: `hsl(${board.hue} 55% 60%)` }}
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
                <p className="min-w-0 text-sm leading-relaxed text-neutral-400">
                  <span className="text-neutral-100">{item.person.name}</span>{" "}
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
