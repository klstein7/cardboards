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

export default function DashboardCobaltPage() {
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
                className={`text-sm transition-colors ${
                  item.active
                    ? "text-blue-400"
                    : "text-neutral-500 hover:text-neutral-200"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <span className="flex size-8 items-center justify-center bg-neutral-800 font-mono text-xs text-neutral-300">
            KS
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-4 pt-12">
          <h1 className="text-3xl font-semibold tracking-tight">
            Atlas rebuild
          </h1>
          <button className="flex items-center gap-1.5 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500">
            <IconPlus size={15} strokeWidth={2} />
            New board
          </button>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-px border border-neutral-800 bg-neutral-800 lg:grid-cols-4">
          {dashboardStats.map((stat) => (
            <div key={stat.label} className="bg-neutral-950 p-6">
              <p className="font-mono text-xs text-neutral-500">
                {stat.label}
              </p>
              <p className="mt-2 font-mono text-3xl font-medium tracking-tight text-blue-400">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-12 xl:grid-cols-[1fr_320px]">
          <section>
            <h2 className="font-mono text-xs text-neutral-500">Boards</h2>
            <div className="mt-3 border border-neutral-800">
              {dashboardBoards.map((board, index) => (
                <a
                  key={board.name}
                  href="#"
                  className={`group flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-[#0d0e11] ${
                    index > 0 ? "border-t border-neutral-800" : ""
                  }`}
                >
                  <span className="flex items-center gap-3 font-medium group-hover:text-blue-400">
                    <span
                      className="size-2"
                      style={{ backgroundColor: `hsl(${board.hue} 55% 60%)` }}
                    />
                    {board.name}
                  </span>
                  <span className="flex items-center gap-6 font-mono text-sm text-neutral-500">
                    <span>
                      {board.doneCount}/{board.cardCount}
                    </span>
                    <span className="text-blue-400">
                      {Math.round((board.doneCount / board.cardCount) * 100)}%
                    </span>
                    <span className="hidden sm:inline">
                      {board.members
                        .map((member) => member.initials)
                        .join(" ")}
                    </span>
                  </span>
                </a>
              ))}
              <button className="flex w-full items-center gap-2 border-t border-neutral-800 px-5 py-4 text-sm text-neutral-500 transition-colors hover:text-neutral-200">
                <IconPlus size={14} strokeWidth={1.5} />
                New board
              </button>
            </div>
          </section>

          <section>
            <h2 className="font-mono text-xs text-neutral-500">Activity</h2>
            <div className="mt-3 space-y-4 border border-neutral-800 p-5">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-baseline gap-3">
                  <p className="min-w-0 text-[13px] leading-relaxed text-neutral-400">
                    <span className="text-neutral-100">
                      {item.person.name}
                    </span>{" "}
                    {item.action}
                    {item.target ? (
                      <span className="text-neutral-500"> {item.target}</span>
                    ) : null}
                  </p>
                  <span className="ml-auto shrink-0 font-mono text-[11px] text-neutral-600">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
