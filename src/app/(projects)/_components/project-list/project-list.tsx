"use client";

import { motion, type Variants } from "framer-motion";
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

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

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
    <div className="w-full max-w-7xl space-y-6">
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

      {hasFilters && filteredProjects.length === 0 ? (
        <div className="grid place-items-center rounded-lg border border-dashed py-10">
          <div className="flex flex-col items-center">
            <h3 className="text-base font-medium">No matching projects</h3>
            <p className="mb-3 mt-1 text-center text-sm text-muted-foreground">
              No projects match your search criteria.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-primary ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Clear search
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Favorites Section */}
          {hasFavorites && (
            <section>
              <div className="mb-4 flex items-center border-b border-border/50 pb-2 dark:border-border/40">
                <Star className="mr-2 h-4 w-4 fill-primary text-primary drop-shadow-sm" />
                <h3 className="text-base font-medium text-foreground">
                  Favorites
                </h3>
              </div>
              <motion.div
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {sortedFavorites.map((project) => (
                  <motion.div
                    key={project.id}
                    variants={item}
                    className="h-full"
                  >
                    <ProjectItem project={project} />
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}

          {/* Projects Section */}
          <section>
            <div className="mb-4 flex items-center border-b border-border/50 pb-2 dark:border-border/40">
              <h3 className="text-base font-medium text-foreground">
                {hasFavorites ? "All Projects" : "Projects"}
              </h3>
            </div>
            <motion.div
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {!hasFilters && (
                <motion.div variants={item} className="h-full">
                  <CreateProjectCard />
                </motion.div>
              )}

              {sortedRegulars.map((project) => (
                <motion.div key={project.id} variants={item} className="h-full">
                  <ProjectItem project={project} />
                </motion.div>
              ))}
            </motion.div>
          </section>
        </div>
      )}
    </div>
  );
}
