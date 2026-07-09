"use client";

import { ChevronDown, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "~/lib/utils";

import {
  BoardStudyRow,
  ProgressLine,
  ProjectHealthLabel,
  ProjectMemberStack,
  ProjectStudyHeader,
} from "../_lib/project-study-bits";
import { projectStudies, projectStudyTotals } from "../_lib/project-study-data";
import { ProjectStudySwitcher } from "../_lib/project-study-switcher";

type RegisterFilter = "all" | "starred";

export default function ProjectsRegisterPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RegisterFilter>("all");
  const [selectedBoardId, setSelectedBoardId] = useState("launch-checklist");

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return projectStudies.filter((project) => {
      const matchesFilter = filter === "all" || project.favorite;
      const matchesQuery =
        !normalizedQuery ||
        [
          project.name,
          project.summary,
          ...project.boards.map(({ name }) => name),
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <ProjectStudyHeader study="Register" />

      <div className="min-h-0 flex-1 overflow-y-auto pb-20">
        <section className="mx-auto w-full max-w-[1480px] px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pt-14">
          <div className="grid gap-8 border-b border-border pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <h1 className="text-4xl font-light tracking-[-0.03em] sm:text-5xl">
                Projects
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Every active workspace, its boards, and the people carrying the
                work forward.
              </p>
            </div>

            <dl className="flex flex-wrap items-center gap-x-7 gap-y-3 font-mono text-[10px] uppercase tracking-[0.11em]">
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Projects</dt>
                <dd>{projectStudyTotals.projects}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Boards</dt>
                <dd>{projectStudyTotals.boards}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">People</dt>
                <dd className="text-primary">{projectStudyTotals.members}</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col gap-4 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between">
            <div
              className="flex items-center"
              role="group"
              aria-label="Filter projects"
            >
              {(["all", "starred"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  aria-pressed={filter === value}
                  className={cn(
                    "min-h-10 border-b px-3 text-xs capitalize transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    filter === value
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>

            <label className="flex min-h-10 items-center gap-2 border-b border-border focus-within:border-foreground sm:w-64">
              <Search
                className="h-3.5 w-3.5 text-muted-foreground"
                aria-hidden
              />
              <span className="sr-only">Search projects and boards</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search projects and boards"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
          </div>

          {visibleProjects.length > 0 ? (
            <div className="border-x border-border">
              {visibleProjects.map((project, index) => (
                <details
                  key={project.id}
                  open={query ? true : undefined}
                  className="group border-b border-border"
                >
                  <summary className="grid min-h-24 cursor-pointer list-none items-center gap-5 px-4 py-5 transition-colors hover:bg-accent/25 focus-visible:bg-accent/25 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring sm:grid-cols-[34px_minmax(180px,.8fr)_minmax(260px,1.2fr)_auto_22px] sm:px-5 [&::-webkit-details-marker]:hidden">
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2.5">
                        {project.favorite && (
                          <Star
                            className="h-3 w-3 fill-primary text-primary"
                            aria-label="Starred project"
                          />
                        )}
                        <span className="truncate text-xl font-light tracking-[-0.015em] sm:text-2xl">
                          {project.name}
                        </span>
                      </span>
                      <span className="mt-1.5 block font-mono text-[9px] uppercase tracking-[0.11em] text-muted-foreground">
                        {project.code} · Updated {project.updated}
                      </span>
                    </span>
                    <span className="max-w-[55ch] text-sm leading-relaxed text-muted-foreground">
                      {project.summary}
                    </span>
                    <span className="flex items-center gap-5 sm:justify-end">
                      <ProjectHealthLabel health={project.health} />
                      <ProjectMemberStack members={project.members} />
                    </span>
                    <ChevronDown
                      className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                      aria-hidden
                    />
                  </summary>

                  <div className="border-t border-border bg-accent/[0.12] sm:grid sm:grid-cols-[34px_minmax(180px,.8fr)_minmax(0,1.2fr)_auto_22px] sm:gap-5 sm:px-5">
                    <div className="hidden sm:block" />
                    <div className="border-b border-border px-4 py-5 sm:border-b-0 sm:px-0">
                      <p className="font-mono text-[9px] uppercase tracking-[0.11em] text-muted-foreground">
                        Completion
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <ProgressLine
                          value={project.progress}
                          className="flex-1"
                        />
                        <span className="font-mono text-[10px] tabular-nums">
                          {project.progress}%
                        </span>
                      </div>
                    </div>
                    <div className="divide-y divide-border/70 sm:border-x sm:border-border">
                      {project.boards.map((board) => (
                        <BoardStudyRow
                          key={board.id}
                          board={board}
                          selected={selectedBoardId === board.id}
                          onSelect={() => setSelectedBoardId(board.id)}
                        />
                      ))}
                    </div>
                    <div className="hidden sm:block" />
                    <div className="hidden sm:block" />
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <div className="border-x border-b border-border px-5 py-16 text-center">
              <h2 className="text-xl font-light">No matching projects</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different name, board, or project filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  setQuery("");
                }}
                className="mt-5 min-h-11 border border-primary px-4 text-sm text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>

      <ProjectStudySwitcher active="register" />
    </main>
  );
}
