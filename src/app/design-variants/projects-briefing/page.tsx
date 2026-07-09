"use client";

import { ArrowRight, Search, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { cn } from "~/lib/utils";

import { MemberAvatar } from "../_lib/bits";
import {
  BoardStudyRow,
  ProgressLine,
  ProjectHealthLabel,
  ProjectMemberStack,
  ProjectStudyHeader,
} from "../_lib/project-study-bits";
import { projectStudies, projectStudyTotals } from "../_lib/project-study-data";
import { ProjectStudySwitcher } from "../_lib/project-study-switcher";

export default function ProjectsBriefingPage() {
  const [selectedProjectId, setSelectedProjectId] = useState("skylight");
  const [selectedBoardId, setSelectedBoardId] = useState("launch-checklist");
  const [query, setQuery] = useState("");

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return projectStudies;

    return projectStudies.filter((project) =>
      project.name.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [query]);
  const activeProject =
    projectStudies.find((project) => project.id === selectedProjectId) ??
    projectStudies[0]!;

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <ProjectStudyHeader study="Briefing">
        <span className="hidden items-center border-l border-border px-4 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground lg:flex">
          Portfolio updated today
        </span>
      </ProjectStudyHeader>

      <div className="min-h-0 flex-1 overflow-y-auto pb-20 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:overflow-hidden">
        <aside className="border-b border-border lg:min-h-0 lg:border-b-0 lg:border-r">
          <div className="border-b border-border px-4 py-5">
            <div className="flex items-baseline justify-between gap-4">
              <h1 className="text-2xl font-light tracking-[-0.02em]">
                Projects
              </h1>
              <span className="font-mono text-[10px] text-muted-foreground">
                {String(projectStudyTotals.projects).padStart(2, "0")}
              </span>
            </div>
            <label className="mt-5 flex min-h-10 items-center gap-2 border-b border-border focus-within:border-foreground">
              <Search
                className="h-3.5 w-3.5 text-muted-foreground"
                aria-hidden
              />
              <span className="sr-only">Find a project</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find a project"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
          </div>

          <div className="flex overflow-x-auto lg:block lg:h-[calc(100%-120px)] lg:overflow-y-auto">
            {visibleProjects.map((project) => {
              const isSelected = project.id === activeProject.id;

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setSelectedBoardId(project.boards[0]?.id ?? "");
                  }}
                  aria-pressed={isSelected}
                  className={cn(
                    "group flex min-h-24 w-64 shrink-0 flex-col justify-between border-r border-border px-4 py-4 text-left transition-colors hover:bg-accent/35 focus-visible:bg-accent/35 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring lg:w-full lg:border-b lg:border-r-0",
                    isSelected && "bg-accent/55",
                  )}
                >
                  <span className="flex w-full items-center gap-2">
                    {project.favorite && (
                      <Star
                        className="h-3 w-3 fill-primary text-primary"
                        aria-hidden
                      />
                    )}
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-sm font-medium transition-colors group-hover:text-primary",
                        isSelected && "text-primary",
                      )}
                    >
                      {project.name}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {project.code}
                    </span>
                  </span>
                  <span className="flex w-full items-center justify-between gap-3">
                    <ProjectHealthLabel health={project.health} />
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {project.boards.length} boards
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="min-h-0 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            <div className="grid gap-7 border-b border-border pb-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-4xl font-light tracking-[-0.03em] sm:text-5xl">
                    {activeProject.name}
                  </h2>
                  <ProjectHealthLabel health={activeProject.health} />
                </div>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {activeProject.summary}
                </p>
              </div>

              <div className="flex items-center gap-5 md:justify-end">
                <ProjectMemberStack members={activeProject.members} max={5} />
                <Link
                  href="/projects"
                  className="group flex min-h-11 items-center gap-2 border border-border px-3 text-xs transition-colors hover:border-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Open project
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden
                  />
                </Link>
              </div>
            </div>

            <div className="grid gap-8 py-7 md:grid-cols-[minmax(0,1fr)_220px] md:items-start">
              <div>
                <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.1em]">
                  <span className="text-muted-foreground">
                    Project completion
                  </span>
                  <span>{activeProject.progress}%</span>
                </div>
                <ProgressLine value={activeProject.progress} className="mt-3" />
              </div>
              <dl className="grid grid-cols-2 gap-4 border-l border-border pl-5 font-mono text-[9px] uppercase tracking-[0.1em]">
                <div>
                  <dt className="text-muted-foreground">Boards</dt>
                  <dd className="mt-1.5 text-sm text-foreground">
                    {activeProject.boards.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Updated</dt>
                  <dd className="mt-1.5 text-xs text-foreground">
                    {activeProject.updated}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="grid gap-10 border-t border-border pt-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
              <section>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h3 className="text-lg font-medium">Boards</h3>
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                    Completed / total
                  </span>
                </div>
                <div className="border-x border-t border-border">
                  {activeProject.boards.map((board) => (
                    <div key={board.id} className="border-b border-border">
                      <BoardStudyRow
                        board={board}
                        selected={selectedBoardId === board.id}
                        onSelect={() => setSelectedBoardId(board.id)}
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h3 className="text-lg font-medium">Recent activity</h3>
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                    Latest
                  </span>
                </div>
                <div className="border-t border-border">
                  {activeProject.activity.map((activity) => (
                    <div
                      key={`${activity.person.name}-${activity.target}`}
                      className="flex gap-3 border-b border-border py-4"
                    >
                      <MemberAvatar
                        person={activity.person}
                        className="mt-0.5 shrink-0"
                      />
                      <p className="min-w-0 flex-1 text-sm leading-relaxed">
                        <span className="font-medium">
                          {activity.person.name}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {activity.action}
                        </span>{" "}
                        <span>{activity.target}</span>
                      </p>
                      <span className="shrink-0 font-mono text-[9px] text-muted-foreground">
                        {activity.when}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>

      <ProjectStudySwitcher active="briefing" />
    </main>
  );
}
