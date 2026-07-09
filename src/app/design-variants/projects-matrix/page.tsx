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
import { type ProjectHealth, projectStudies } from "../_lib/project-study-data";
import { ProjectStudySwitcher } from "../_lib/project-study-switcher";

type MatrixFilter = "All" | ProjectHealth;
type MatrixSort = "name" | "progress" | "boards";

export default function ProjectsMatrixPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MatrixFilter>("All");
  const [sort, setSort] = useState<MatrixSort>("progress");
  const [expandedProjectId, setExpandedProjectId] = useState("northstar");

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return projectStudies
      .filter(
        (project) =>
          (filter === "All" || project.health === filter) &&
          (!normalizedQuery ||
            project.name.toLocaleLowerCase().includes(normalizedQuery)),
      )
      .sort((first, second) => {
        if (sort === "name") return first.name.localeCompare(second.name);
        if (sort === "boards")
          return second.boards.length - first.boards.length;
        return first.progress - second.progress;
      });
  }, [filter, query, sort]);

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <ProjectStudyHeader study="Matrix" />

      <div className="min-h-0 flex-1 overflow-y-auto pb-20">
        <section className="mx-auto w-full max-w-[1560px] px-4 pb-10 pt-9 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 border-b border-border pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-light tracking-[-0.03em]">
                Project matrix
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Compare portfolio health, board load, completion, and recency in
                one compact working view.
              </p>
            </div>

            <label className="flex min-h-11 items-center gap-2 border-b border-border focus-within:border-foreground lg:w-72">
              <Search
                className="h-3.5 w-3.5 text-muted-foreground"
                aria-hidden
              />
              <span className="sr-only">Search project matrix</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find a project"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
          </div>

          <div className="flex flex-col gap-4 border-b border-border py-4 md:flex-row md:items-center md:justify-between">
            <div
              className="flex max-w-full overflow-x-auto"
              role="group"
              aria-label="Filter by health"
            >
              {(
                ["All", "On track", "Needs attention", "Planning"] as const
              ).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  aria-pressed={filter === value}
                  className={cn(
                    "min-h-10 whitespace-nowrap border-b px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    filter === value
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Sort
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as MatrixSort)}
                className="min-h-10 border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="progress">Needs progress</option>
                <option value="boards">Most boards</option>
                <option value="name">Project name</option>
              </select>
            </label>
          </div>

          <div
            className="border-x border-border"
            role="table"
            aria-label="Project portfolio matrix"
          >
            <div
              role="row"
              className="hidden h-10 grid-cols-[minmax(190px,1.15fr)_150px_130px_90px_minmax(160px,.8fr)_130px_28px] items-center gap-4 border-b border-border px-4 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground lg:grid"
            >
              <span role="columnheader">Project</span>
              <span role="columnheader">Health</span>
              <span role="columnheader">People</span>
              <span role="columnheader">Boards</span>
              <span role="columnheader">Completion</span>
              <span role="columnheader">Updated</span>
              <span />
            </div>

            {visibleProjects.map((project) => {
              const isExpanded = expandedProjectId === project.id;

              return (
                <div
                  key={project.id}
                  role="rowgroup"
                  className="border-b border-border"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedProjectId(isExpanded ? "" : project.id)
                    }
                    aria-expanded={isExpanded}
                    className={cn(
                      "group grid min-h-24 w-full gap-4 px-4 py-4 text-left transition-colors hover:bg-accent/35 focus-visible:bg-accent/35 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring sm:grid-cols-2 lg:min-h-20 lg:grid-cols-[minmax(190px,1.15fr)_150px_130px_90px_minmax(160px,.8fr)_130px_28px] lg:items-center lg:py-3",
                      isExpanded && "bg-accent/50",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        {project.favorite && (
                          <Star
                            className="h-3 w-3 fill-primary text-primary"
                            aria-label="Starred project"
                          />
                        )}
                        <span
                          className={cn(
                            "truncate text-sm font-medium group-hover:text-primary",
                            isExpanded && "text-primary",
                          )}
                        >
                          {project.name}
                        </span>
                      </span>
                      <span className="mt-1 block font-mono text-[9px] text-muted-foreground lg:hidden">
                        {project.code}
                      </span>
                    </span>
                    <span>
                      <ProjectHealthLabel health={project.health} />
                    </span>
                    <span>
                      <ProjectMemberStack members={project.members} max={3} />
                    </span>
                    <span className="font-mono text-xs tabular-nums">
                      <span className="mr-2 text-muted-foreground lg:hidden">
                        Boards
                      </span>
                      {String(project.boards.length).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-3">
                        <ProgressLine
                          value={project.progress}
                          className="flex-1"
                        />
                        <span className="font-mono text-[10px] tabular-nums">
                          {project.progress}%
                        </span>
                      </span>
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {project.updated}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform motion-reduce:transition-none",
                        isExpanded && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>

                  {isExpanded && (
                    <div className="grid border-t border-border bg-accent/[0.12] md:grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-[minmax(190px,1.15fr)_minmax(0,2.35fr)]">
                      <div className="border-b border-border px-4 py-5 md:border-b-0 md:border-r">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {project.summary}
                        </p>
                        <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                          {project.activity.length} recent updates
                        </p>
                      </div>
                      <div className="grid sm:grid-cols-2 xl:grid-cols-3">
                        {project.boards.map((board) => (
                          <div
                            key={board.id}
                            className="border-b border-border px-4 sm:border-r xl:border-b-0"
                          >
                            <BoardStudyRow board={board} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {visibleProjects.length === 0 && (
            <div className="border-x border-b border-border py-16 text-center">
              <h2 className="text-xl font-light">No projects match</h2>
              <button
                type="button"
                onClick={() => {
                  setFilter("All");
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

      <ProjectStudySwitcher active="matrix" />
    </main>
  );
}
