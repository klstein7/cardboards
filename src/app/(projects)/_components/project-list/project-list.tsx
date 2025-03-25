"use client";

import { motion, type Variants } from "framer-motion";
import { Star } from "lucide-react";

import { type Project } from "~/app/(project)/_types";
import { useProjects } from "~/lib/hooks";

import { ProjectItem } from "../project-item";
import { CreateProjectCard } from "./create-project-card";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { LoadingState } from "./loading-state";

export function ProjectList() {
  const projects = useProjects();

  if (projects.isError) {
    return <ErrorState error={projects.error} refetch={projects.refetch} />;
  }

  if (projects.isPending) {
    return <LoadingState />;
  }

  if (projects.data.length === 0) {
    return <EmptyState />;
  }

  // Split projects into favorite and regular
  const favoriteProjects = projects.data.filter((p) => p.isFavorite);
  const regularProjects = projects.data.filter((p) => !p.isFavorite);

  // Sort both lists by creation date (newest first)
  const sortByDate = (a: Project, b: Project) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  const sortedFavorites = [...favoriteProjects].sort(sortByDate);
  const sortedRegulars = [...regularProjects].sort(sortByDate);

  const hasFavorites = sortedFavorites.length > 0;

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

  return (
    <div className="w-full max-w-7xl space-y-10">
      {/* Favorites Section */}
      {hasFavorites && (
        <section>
          <div className="mb-4 flex items-center border-b border-border/50 pb-2 dark:border-border/40">
            <Star className="mr-2 h-4 w-4 fill-primary text-primary drop-shadow-sm" />
            <h3 className="text-base font-medium text-foreground">Favorites</h3>
          </div>
          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {sortedFavorites.map((project) => (
              <motion.div key={project.id} variants={item} className="h-full">
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
          <motion.div variants={item} className="h-full">
            <CreateProjectCard />
          </motion.div>

          {regularProjects.length > 0 &&
            sortedRegulars.map((project) => (
              <motion.div key={project.id} variants={item} className="h-full">
                <ProjectItem project={project} />
              </motion.div>
            ))}
        </motion.div>
      </section>
    </div>
  );
}
