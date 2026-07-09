"use client";

import { ArrowRight, Command, Search, Star, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

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

export default function ProjectsSpotlightPage() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) {
      return [...projectStudies].sort(
        (first, second) => Number(!!second.favorite) - Number(!!first.favorite),
      );
    }

    return projectStudies.filter((project) =>
      [
        project.name,
        project.code,
        project.summary,
        ...project.boards.map((board) => board.name),
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);
  const activeProject = visibleProjects[activeIndex] ?? visibleProjects[0];

  const updateQuery = (value: string) => {
    setQuery(value);
    setActiveIndex(0);
  };

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "k"
      ) {
        return;
      }

      event.preventDefault();
      searchRef.current?.focus();
    };

    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <ProjectStudyHeader study="Spotlight" />

      <div className="min-h-0 flex-1 overflow-y-auto pb-20">
        <section className="mx-auto w-full max-w-6xl px-4 pb-12 pt-12 sm:px-6 md:pt-16 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-light tracking-[-0.03em] sm:text-5xl">
              Where do you want to work?
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Search projects, boards, or workspace codes.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <label className="flex min-h-16 items-center gap-3 border-b border-foreground px-1">
              <Search
                className="h-5 w-5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="sr-only">Search projects and boards</span>
              <input
                ref={searchRef}
                autoFocus
                type="search"
                value={query}
                onChange={(event) => updateQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActiveIndex((index) =>
                      Math.min(index + 1, visibleProjects.length - 1),
                    );
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveIndex((index) => Math.max(index - 1, 0));
                  }
                  if (event.key === "Enter" && activeProject) {
                    event.preventDefault();
                    router.push("/projects");
                  }
                }}
                placeholder="Try “launch”, “support”, or “NTH”"
                className="min-w-0 flex-1 bg-transparent text-xl font-light outline-none placeholder:text-muted-foreground/75 sm:text-2xl"
                aria-controls="spotlight-results"
                aria-activedescendant={
                  activeProject ? `spotlight-${activeProject.id}` : undefined
                }
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => updateQuery("")}
                  aria-label="Clear search"
                  className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              ) : (
                <span className="hidden items-center gap-1 border border-border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground sm:flex">
                  <Command className="h-3 w-3" aria-hidden />K
                </span>
              )}
            </label>

            <div className="mt-3 flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
              <span>{visibleProjects.length} results</span>
              <span className="hidden sm:inline">
                ↑↓ to move · Enter to open
              </span>
            </div>
          </div>

          {activeProject ? (
            <div className="mx-auto mt-8 grid max-w-5xl border border-border md:grid-cols-[minmax(260px,.75fr)_minmax(0,1.25fr)]">
              <div
                id="spotlight-results"
                role="listbox"
                aria-label="Matching projects"
                className="border-b border-border md:border-b-0 md:border-r"
              >
                {visibleProjects.map((project, index) => (
                  <button
                    key={project.id}
                    id={`spotlight-${project.id}`}
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "group flex min-h-20 w-full items-center gap-3 border-b border-border px-4 text-left transition-colors last:border-b-0 hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring",
                      index === activeIndex && "bg-accent/55",
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-border font-mono text-[9px] text-muted-foreground">
                      {project.code}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        {project.favorite && (
                          <Star
                            className="h-3 w-3 fill-primary text-primary"
                            aria-label="Starred project"
                          />
                        )}
                        <span
                          className={cn(
                            "truncate text-sm font-medium transition-colors group-hover:text-primary",
                            index === activeIndex && "text-primary",
                          )}
                        >
                          {project.name}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {project.boards.length} boards · {project.updated}
                      </span>
                    </span>
                    <ArrowRight
                      className="h-3.5 w-3.5 text-muted-foreground"
                      aria-hidden
                    />
                  </button>
                ))}
              </div>

              <section className="min-w-0 p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                      {activeProject.code} · Project
                    </p>
                    <h2 className="mt-2 text-3xl font-light tracking-[-0.025em]">
                      {activeProject.name}
                    </h2>
                  </div>
                  <ProjectHealthLabel health={activeProject.health} />
                </div>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {activeProject.summary}
                </p>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <ProjectMemberStack members={activeProject.members} />
                  <span className="font-mono text-[10px] tabular-nums">
                    {activeProject.progress}%
                  </span>
                </div>
                <ProgressLine value={activeProject.progress} className="mt-3" />

                <div className="mt-7 border-t border-border">
                  {activeProject.boards.slice(0, 4).map((board) => (
                    <div key={board.id} className="border-b border-border">
                      <BoardStudyRow board={board} />
                    </div>
                  ))}
                </div>

                <Link
                  href="/projects"
                  className="group mt-6 flex min-h-11 items-center justify-between border border-primary px-3 text-sm text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Open {activeProject.name}
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden
                  />
                </Link>
              </section>
            </div>
          ) : (
            <div className="mx-auto mt-8 max-w-4xl border border-dashed border-border px-5 py-16 text-center">
              <h2 className="text-xl font-light">No matching workspace</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a project name, code, or board title.
              </p>
              <button
                type="button"
                onClick={() => updateQuery("")}
                className="mt-5 min-h-11 border border-primary px-4 text-sm text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Clear search
              </button>
            </div>
          )}
        </section>
      </div>

      <ProjectStudySwitcher active="spotlight" />
    </main>
  );
}
