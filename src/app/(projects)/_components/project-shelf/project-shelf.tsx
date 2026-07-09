"use client";

import { format } from "date-fns";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";

import { type Project } from "~/app/(project)/_types";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useProjects } from "~/lib/hooks";

import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { LoadingState } from "./loading-state";

const MAX_VISIBLE_MEMBERS = 4;

function MemberStack({ project }: { project: Project }) {
  const members = project.projectUsers ?? [];
  const visibleMembers = members.slice(0, MAX_VISIBLE_MEMBERS);
  const extraMembers = members.length - visibleMembers.length;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-1.5">
        {visibleMembers.map((projectUser) => (
          <Avatar
            key={projectUser.id}
            title={projectUser.user.name}
            className="h-5 w-5 ring-2 ring-background"
          >
            <AvatarImage src={projectUser.user.imageUrl ?? undefined} />
            <AvatarFallback className="text-[8px]">
              {projectUser.user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {extraMembers > 0 && (
        <span className="ml-2 font-mono text-[9px] text-muted-foreground">
          +{extraMembers}
        </span>
      )}
    </div>
  );
}

function ProjectPanel({ project }: { project: Project }) {
  const boards = [...(project.boards ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <section className="flex min-h-56 flex-col border-b border-r border-border bg-background">
      <header className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3">
        {project.isFavorite ? (
          <Star className="h-3 w-3 shrink-0 fill-primary text-primary" />
        ) : (
          <span className="h-3 w-3 shrink-0" aria-hidden />
        )}
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {project.name}
        </span>
        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
          {String(boards.length).padStart(2, "0")}
        </span>
      </header>

      <div className="min-h-0 flex-1 divide-y divide-border/60">
        {boards.length > 0 ? (
          boards.map((board) => (
            <Link
              key={board.id}
              href={`/p/${project.id}/b/${board.id}`}
              className="group flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none"
              aria-label={`Open ${board.name} board`}
            >
              <span
                className="h-3 w-0.5 shrink-0"
                style={{ backgroundColor: board.color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-[12.5px] transition-colors group-hover:text-primary">
                {board.name}
              </span>
              <span className="shrink-0 font-mono text-[9px] text-muted-foreground">
                {format(new Date(board.updatedAt ?? board.createdAt), "MMM d")}
              </span>
            </Link>
          ))
        ) : (
          <p className="px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            No boards yet
          </p>
        )}
      </div>

      <footer className="flex h-9 shrink-0 items-center justify-between border-t border-border pl-3">
        <MemberStack project={project} />
        <Link
          href={`/p/${project.id}`}
          className="group flex h-full items-center gap-1.5 px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
          aria-label={`Open ${project.name} project`}
        >
          Open project
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </footer>
    </section>
  );
}

export function ProjectShelf() {
  const projects = useProjects();
  const [search, setSearch] = useQueryState("search", parseAsString);

  if (projects.isError) {
    return <ErrorState error={projects.error} refetch={projects.refetch} />;
  }

  if (projects.isPending) {
    return <LoadingState />;
  }

  if (projects.data.length === 0) {
    return <EmptyState />;
  }

  const query = (search ?? "").toLowerCase().trim();
  const filteredProjects = query
    ? projects.data.filter((project) =>
        project.name.toLowerCase().includes(query),
      )
    : projects.data;

  if (filteredProjects.length === 0) {
    return (
      <div className="flex flex-col items-center border border-border py-16 text-center">
        <h2 className="text-lg font-light tracking-tight">
          No matching projects
        </h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Nothing in this workspace matches “{search}”.
        </p>
        <button
          onClick={() => void setSearch(null)}
          className="mt-5 border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          Clear search
        </button>
      </div>
    );
  }

  const orderedProjects = [
    ...filteredProjects.filter((project) => project.isFavorite),
    ...filteredProjects.filter((project) => !project.isFavorite),
  ];
  const boardCount = filteredProjects.reduce(
    (sum, project) => sum + (project.boards?.length ?? 0),
    0,
  );

  return (
    <div>
      <div className="grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
        {orderedProjects.map((project) => (
          <ProjectPanel key={project.id} project={project} />
        ))}
      </div>
      <p className="mt-3 text-right font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        {filteredProjects.length}{" "}
        {filteredProjects.length === 1 ? "project" : "projects"} · {boardCount}{" "}
        {boardCount === 1 ? "board" : "boards"}
      </p>
    </div>
  );
}
