"use client";

import { useCallback, useMemo, useState } from "react";

import { type Project } from "~/app/(project)/_types";
import { useProjects } from "~/lib/hooks";
import { cn } from "~/lib/utils";

import { ProjectItem } from "../project-item";
import { type ProjectSortOption, SearchBar } from "../search-bar";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { LoadingState } from "./loading-state";

export function ProjectList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<ProjectSortOption>("recent");

  const projects = useProjects();

  const filteredProjects = useMemo(() => {
    if (!projects.data) return [];
    if (!searchQuery.trim()) return projects.data;

    const query = searchQuery.toLowerCase().trim();
    return projects.data.filter((project) =>
      project.name.toLowerCase().includes(query),
    );
  }, [projects.data, searchQuery]);

  const sortProjects = useCallback(
    (projectsList: Project[]) => {
      const projectsCopy = [...projectsList];

      switch (sortOption) {
        case "recent":
          return projectsCopy.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
        case "name":
          return projectsCopy.sort((a, b) => a.name.localeCompare(b.name));
        case "members":
          return projectsCopy.sort(
            (a, b) =>
              (b.projectUsers?.length ?? 0) - (a.projectUsers?.length ?? 0),
          );
        case "boards":
          return projectsCopy.sort(
            (a, b) => (b.boards?.length ?? 0) - (a.boards?.length ?? 0),
          );
        default:
          return projectsCopy;
      }
    },
    [sortOption],
  );

  const sortedFavorites = useMemo(
    () => sortProjects(filteredProjects.filter((p) => p.isFavorite)),
    [filteredProjects, sortProjects],
  );
  const sortedRegulars = useMemo(
    () => sortProjects(filteredProjects.filter((p) => !p.isFavorite)),
    [filteredProjects, sortProjects],
  );

  if (projects.isError) {
    return <ErrorState error={projects.error} refetch={projects.refetch} />;
  }

  if (projects.isPending) {
    return <LoadingState />;
  }

  if (projects.data.length === 0) {
    return <EmptyState />;
  }

  const totalBoards = projects.data.reduce(
    (sum, project) => sum + (project.boards?.length ?? 0),
    0,
  );
  const totalFavorites = projects.data.filter((p) => p.isFavorite).length;
  const hasFavorites = sortedFavorites.length > 0;
  const hasFilters = searchQuery.trim() !== "";
  const noMatches = hasFilters && filteredProjects.length === 0;

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-3 gap-x-8">
        <Stat label="Projects" value={projects.data.length} />
        <Stat label="Favorites" value={totalFavorites} />
        <Stat label="Boards" value={totalBoards} accent />
      </div>

      <div className="space-y-8">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortOption={sortOption}
          setSortOption={setSortOption}
        />

        {noMatches ? (
          <div className="grid place-items-center border border-dashed border-border py-16 text-center">
            <div className="flex flex-col items-center px-4">
              <h3 className="text-lg font-light tracking-tight">
                No matching projects
              </h3>
              <p className="mb-4 mt-1 max-w-sm text-sm text-muted-foreground">
                No projects match your search.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Clear search
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {hasFavorites && (
              <ProjectSection title="Favorites" projects={sortedFavorites} />
            )}
            <ProjectSection
              title={hasFavorites ? "All projects" : "Projects"}
              projects={sortedRegulars}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className={cn("border-t-2 pt-5", accent ? "border-primary" : "border-border")}>
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-4xl font-extralight tracking-tight tabular-nums md:text-5xl",
          accent && "text-primary",
        )}
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function ProjectSection({
  title,
  projects,
}: {
  title: string;
  projects: Project[];
}) {
  if (projects.length === 0) return null;

  return (
    <section>
      <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h2>
      <div className="mt-2 divide-y divide-border border-t border-border">
        {projects.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
