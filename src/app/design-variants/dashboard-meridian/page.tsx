import {
  IconHistory,
  IconLayoutKanban,
  IconPlus,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";

import {
  dashboardBoards,
  dashboardStats,
  type MockPerson,
  recentActivity,
} from "../_lib/mock-data";

const railNav = [
  { label: "Boards", icon: IconLayoutKanban, active: true },
  { label: "Members", icon: IconUsers, active: false },
  { label: "Activity", icon: IconHistory, active: false },
  { label: "Settings", icon: IconSettings, active: false },
];

function MeridianAvatar({ person }: { person: MockPerson }) {
  return (
    <span
      className="flex size-6 items-center justify-center rounded-full text-[10px] font-medium ring-1 ring-white/10"
      style={{
        backgroundColor: `hsl(${person.hue} 25% 20%)`,
        color: `hsl(${person.hue} 50% 78%)`,
      }}
      title={person.name}
    >
      {person.initials}
    </span>
  );
}

export default function DashboardMeridianPage() {
  return (
    <div className="flex min-h-dvh bg-[#060a12] text-slate-200">
      <aside className="hidden w-16 shrink-0 flex-col items-center border-r border-white/[0.06] py-5 lg:flex">
        <Link
          href="/design-variants"
          className="flex size-9 items-center justify-center rounded-xl bg-sky-300 font-semibold text-[#060a12]"
        >
          c
        </Link>
        <nav className="mt-8 flex flex-col gap-2">
          {railNav.map((item) => (
            <a
              key={item.label}
              href="#"
              title={item.label}
              className={`flex size-10 items-center justify-center rounded-xl transition-colors ${
                item.active
                  ? "bg-white/[0.07] text-sky-300"
                  : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
              }`}
            >
              <item.icon size={19} strokeWidth={1.5} />
            </a>
          ))}
        </nav>
        <span className="mt-auto flex size-9 items-center justify-center rounded-full bg-white/[0.07] text-xs font-medium text-slate-300">
          KS
        </span>
      </aside>

      <main className="min-w-0 flex-1 [background-image:radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(56,189,248,0.08),transparent)]">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-light tracking-tight text-white">
                Atlas rebuild
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                3 boards, 5 members
              </p>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg bg-sky-300 px-4 py-2 text-sm font-semibold text-[#060a12] transition-colors hover:bg-sky-200">
              <IconPlus size={15} strokeWidth={2} />
              New board
            </button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {dashboardStats.map((stat, index) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.06]"
              >
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p
                  className={`mt-2 font-mono text-3xl font-light tracking-tight ${
                    index === 0 ? "text-sky-300" : "text-white"
                  }`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-12 xl:grid-cols-[1fr_300px]">
            <section>
              <h2 className="text-sm text-slate-500">Boards</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {dashboardBoards.map((board) => (
                  <a
                    key={board.name}
                    href="#"
                    className="rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-px transition-opacity hover:opacity-90"
                  >
                    <div className="h-full rounded-2xl bg-[#0a1120] p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-medium text-white">
                          {board.name}
                        </h3>
                        <div className="flex -space-x-1.5">
                          {board.members.map((member) => (
                            <MeridianAvatar
                              key={member.initials}
                              person={member}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-slate-500">
                        <span className="font-mono text-slate-300">
                          {board.doneCount}
                        </span>{" "}
                        of{" "}
                        <span className="font-mono text-slate-300">
                          {board.cardCount}
                        </span>{" "}
                        cards done
                      </p>
                      <div className="mt-3 h-px w-full bg-white/[0.07]">
                        <div
                          className="h-px bg-sky-300"
                          style={{
                            width: `${Math.round((board.doneCount / board.cardCount) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </a>
                ))}
                <button className="flex min-h-28 items-center justify-center gap-1.5 rounded-2xl text-sm text-slate-500 ring-1 ring-white/[0.06] transition-colors hover:text-slate-300 hover:ring-white/[0.12]">
                  <IconPlus size={16} strokeWidth={1.5} />
                  New board
                </button>
              </div>
            </section>

            <section>
              <h2 className="text-sm text-slate-500">Activity</h2>
              <div className="mt-4 space-y-4">
                {recentActivity.map((item, index) => (
                  <div key={index} className="flex gap-2.5">
                    <MeridianAvatar person={item.person} />
                    <div className="min-w-0">
                      <p className="text-[13px] leading-snug text-slate-300">
                        <span className="font-medium text-white">
                          {item.person.name}
                        </span>{" "}
                        {item.action}
                      </p>
                      {item.target ? (
                        <p className="mt-0.5 truncate text-[13px] text-slate-500">
                          {item.target}
                        </p>
                      ) : null}
                      <p className="mt-0.5 font-mono text-[11px] text-slate-600">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
