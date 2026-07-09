"use client";

import { ArrowDown, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { cn } from "~/lib/utils";

import {
  BoardStudyRow,
  ProgressLine,
  ProjectHealthLabel,
  ProjectMemberStack,
  ProjectStudyHeader,
} from "../_lib/project-study-bits";
import { projectStudies } from "../_lib/project-study-data";
import { ProjectStudySwitcher } from "../_lib/project-study-switcher";

type AtlasFilter = "all" | "starred" | "attention";

export default function ProjectsAtlasPage() {
  const [filter, setFilter] = useState<AtlasFilter>("all");
  const [focusedProjectId, setFocusedProjectId] = useState("skylight");

  const visibleProjects = useMemo(
    () =>
      projectStudies.filter((project) => {
        if (filter === "starred") return project.favorite;
        if (filter === "attention") {
          return project.health === "Needs attention";
        }
        return true;
      }),
    [filter],
  );

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <ProjectStudyHeader study="Atlas" />

      <div className="min-h-0 flex-1 overflow-y-auto pb-20">
        <section className="mx-auto w-full max-w-[1600px] px-4 pb-10 pt-10 sm:px-6 md:pt-14 lg:px-10">
          <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.55fr)] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-light leading-[1.05] tracking-[-0.03em] sm:text-5xl">
                A wider view of every project in motion.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Move from the portfolio signal to the boards beneath it without
                losing the shape of the whole workspace.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1 lg:justify-end">
              {(["all", "starred", "attention"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  aria-pressed={filter === value}
                  className={cn(
                    "min-h-11 border px-3 text-xs capitalize transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    filter === value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="border-x border-border">
            {visibleProjects.map((project, index) => {
              const isFocused = focusedProjectId === project.id;

              return (
                <article
                  key={project.id}
                  className={cn(
                    "border-b border-border transition-colors duration-200 motion-reduce:transition-none",
                    isFocused && "bg-accent/[0.18]",
                  )}
                >
                  <div className="grid gap-8 px-5 py-8 md:grid-cols-[minmax(210px,.65fr)_minmax(0,1.35fr)] md:px-7 md:py-10 xl:grid-cols-[90px_minmax(220px,.55fr)_minmax(0,1.45fr)]">
                    <div className="hidden xl:block">
                      <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                        {String(index + 1).padStart(2, "0")} /{" "}
                        {String(visibleProjects.length).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-col justify-between gap-8">
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          {project.favorite && (
                            <Star
                              className="h-3 w-3 fill-primary text-primary"
                              aria-label="Starred project"
                            />
                          )}
                          <span className="font-mono text-[9px] uppercase tracking-[0.11em] text-muted-foreground">
                            {project.code}
                          </span>
                        </div>
                        <h2
                          className={cn(
                            "mt-4 text-4xl font-light tracking-[-0.03em] transition-colors sm:text-5xl",
                            isFocused && "text-primary",
                          )}
                        >
                          {project.name}
                        </h2>
                        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                          {project.summary}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-5">
                        <ProjectHealthLabel health={project.health} />
                        <ProjectMemberStack members={project.members} />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
                        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                          <span>{project.boards.length} boards</span>
                          <span>Updated {project.updated}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFocusedProjectId(project.id)}
                          aria-pressed={isFocused}
                          className="flex min-h-10 items-center gap-2 px-2 text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {isFocused ? "In focus" : "Focus project"}
                          <ArrowDown
                            className={cn(
                              "h-3.5 w-3.5 transition-transform motion-reduce:transition-none",
                              isFocused && "rotate-180",
                            )}
                            aria-hidden
                          />
                        </button>
                      </div>

                      <div className="grid border-b border-border sm:grid-cols-2 sm:divide-x sm:divide-border xl:grid-cols-3">
                        {project.boards.map((board) => (
                          <div
                            key={board.id}
                            className="border-b border-border px-3 last:border-b-0 xl:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0"
                          >
                            <BoardStudyRow board={board} />
                            <ProgressLine
                              value={Math.round(
                                (board.completed / board.cards) * 100,
                              )}
                              className="mb-4"
                            />
                          </div>
                        ))}
                      </div>

                      {isFocused && (
                        <div className="grid gap-4 pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
                          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                            {project.progress}% of tracked work is complete. The
                            latest change landed {project.updated.toLowerCase()}
                            .
                          </p>
                          <Link
                            href="/projects"
                            className="inline-flex min-h-11 items-center border border-primary px-4 text-sm text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            Open {project.name}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {visibleProjects.length === 0 && (
            <div className="border-x border-b border-border py-16 text-center">
              <h2 className="text-xl font-light">No projects in this view</h2>
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="mt-5 min-h-11 border border-primary px-4 text-sm text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Show all projects
              </button>
            </div>
          )}
        </section>
      </div>

      <ProjectStudySwitcher active="atlas" />
    </main>
  );
}
