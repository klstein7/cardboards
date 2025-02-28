"use client";

import { motion, type Variants } from "framer-motion";
import { FolderKanbanIcon, LayoutGridIcon, Loader2, Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { DialogTrigger } from "~/components/ui/dialog";
import { useProjects } from "~/lib/hooks";

import { CreateProjectDialog } from "./create-project-dialog";
import { ProjectItem } from "./project-item";

function EmptyState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-8 py-16 text-center">
      <motion.div
        className="rounded-full bg-primary/10 p-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <FolderKanbanIcon className="h-14 w-14 text-primary" />
      </motion.div>
      <motion.div
        className="space-y-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h3 className="text-3xl font-semibold tracking-tight">
          No projects yet
        </h3>
        <p className="text-lg text-muted-foreground">
          Create your first project to get started with Starboard
        </p>
        <CreateProjectDialog>
          <DialogTrigger asChild>
            <Button size="lg" className="mt-6 gap-2 font-medium">
              <Plus className="h-5 w-5" />
              <span>Create Project</span>
            </Button>
          </DialogTrigger>
        </CreateProjectDialog>
      </motion.div>
    </div>
  );
}

export function ProjectList() {
  const projects = useProjects();

  if (projects.isError) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/30 dark:bg-red-900/10">
        <LayoutGridIcon className="h-10 w-10 text-red-500" />
        <div>
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-400">
            Error loading projects
          </h3>
          <p className="mt-1 text-sm text-red-600 dark:text-red-300">
            {projects.error.message || "Please try again later"}
          </p>
        </div>
        <Button
          variant="secondary"
          className="mt-2"
          onClick={() => projects.refetch()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (projects.isPending) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading projects...</p>
      </div>
    );
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
    <div className="w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Your Projects</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage and organize your work with projects
        </p>
      </header>

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

function CreateProjectCard() {
  return (
    <CreateProjectDialog>
      <DialogTrigger asChild>
        <Card className="group h-[260px] cursor-pointer border-dashed border-border/80 bg-background/50 shadow-sm transition-all duration-200 hover:border-primary hover:bg-secondary/10 hover:shadow-md hover:ring-1 hover:ring-primary/20">
          <CardContent className="flex h-full flex-col items-center justify-center p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                  Create New Project
                </h3>
                <p className="text-sm text-muted-foreground">
                  Start a new collection of boards and organize your work
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
    </CreateProjectDialog>
  );
}
