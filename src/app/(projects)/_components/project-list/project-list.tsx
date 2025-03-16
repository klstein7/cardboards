"use client";

import { motion, type Variants } from "framer-motion";

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
    <div className="w-full max-w-7xl">
      <motion.div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="h-full">
          <CreateProjectCard />
        </motion.div>

        {projects.data.map((project) => (
          <motion.div key={project.id} variants={item} className="h-full">
            <ProjectItem project={project} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
