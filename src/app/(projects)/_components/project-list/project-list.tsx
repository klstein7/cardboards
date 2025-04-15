"use client";

import { Star } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { type Project } from "~/app/(project)/_types";
import { useProjects } from "~/lib/hooks";

import { ProjectItem } from "../project-item";
import { type ProjectSortOption, SearchBar } from "../search-bar";
import { CreateProjectCard } from "./create-project-card";
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

  // Split projects into favorite and regular
  const favoriteProjects = useMemo(() => {
    return filteredProjects.filter((p) => p.isFavorite);
  }, [filteredProjects]);

  const regularProjects = useMemo(() => {
    return filteredProjects.filter((p) => !p.isFavorite);
  }, [filteredProjects]);

  // Sort both lists based on the selected sort option
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
              (b.projectUsers?.length || 0) - (a.projectUsers?.length || 0),
          );
        case "boards":
          return projectsCopy.sort(
            (a, b) => (b.boards?.length || 0) - (a.boards?.length || 0),
          );
        default:
          return projectsCopy;
      }
    },
    [sortOption],
  );

  const sortedFavorites = useMemo(
    () => sortProjects(favoriteProjects),
    [favoriteProjects, sortProjects],
  );
  const sortedRegulars = useMemo(
    () => sortProjects(regularProjects),
    [regularProjects, sortProjects],
  );

  const hasFavorites = sortedFavorites.length > 0;
  const totalProjects = projects.data?.length ?? 0;
  const filteredCount = filteredProjects.length;
  const hasFilters = searchQuery.trim() !== "";
  const hasProjects = totalProjects > 0;

  if (projects.isError) {
    return <ErrorState error={projects.error} refetch={projects.refetch} />;
  }

  if (projects.isPending) {
    return <LoadingState />;
  }

  if (!hasProjects) {
    return <EmptyState />;
  }

  return (
    <div className="w-full">
      {/* Search and Filter */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
        totalProjects={totalProjects}
        filteredCount={filteredCount}
        hasFilters={hasFilters}
      />

      {/* Content Area */}
      <div className="mt-8">
        {hasFilters && filteredProjects.length === 0 ? (
          <div className="grid place-items-center rounded-lg border border-border bg-card py-16 shadow-sm">
            <div className="flex flex-col items-center px-4 text-center">
              <h3 className="text-lg font-semibold text-foreground">
                No matching projects
              </h3>
              <p className="mb-6 mt-2 max-w-md text-sm text-foreground/70">
                No projects match your search criteria. Try adjusting your
                search.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Clear search
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Favorites Section */}
            {hasFavorites && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border py-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Favorites
                  </h3>
                  <div className="rounded-full bg-muted/80 px-2 py-0.5 text-xs font-medium text-foreground">
                    {sortedFavorites.length}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedFavorites.map((project) => (
                    <div key={project.id} className="group h-full">
                      <ProjectItem project={project} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border py-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {hasFavorites ? "All Projects" : "Projects"}
                </h3>
                <div className="rounded-full bg-muted/80 px-2 py-0.5 text-xs font-medium text-foreground">
                  {sortedRegulars.length + (!hasFilters ? 1 : 0)}{" "}
                  {/* +1 for create card */}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {!hasFilters && (
                  <div className="group h-full">
                    <CreateProjectCard />
                  </div>
                )}

                {sortedRegulars.map((project) => (
                  <div key={project.id} className="group h-full">
                    <ProjectItem project={project} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
