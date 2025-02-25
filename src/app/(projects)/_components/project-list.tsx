"use client";

import { motion } from "framer-motion";
import { LayoutGridIcon, Loader2, Plus } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
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
        <LayoutGridIcon className="h-14 w-14 text-primary" />
      </motion.div>
      <motion.div
        className="space-y-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h3 className="text-3xl font-semibold">No projects yet</h3>
        <p className="text-muted-foreground">
          Create your first project to get started with Starboard
        </p>
        <CreateProjectDialog>
          <DialogTrigger asChild>
            <motion.button
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground shadow-md hover:bg-primary/90"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-5 w-5" />
              <span>Create Project</span>
            </motion.button>
          </DialogTrigger>
        </CreateProjectDialog>
      </motion.div>
    </div>
  );
}

export function ProjectList() {
  const projects = useProjects();

  if (projects.isError) throw projects.error;

  if (projects.isPending) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (projects.data.length === 0) {
    return <EmptyState />;
  }

  // Parent animation variables
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
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
        <Card className="group h-[250px] cursor-pointer border-dashed border-border/80 bg-secondary/20 shadow-lg transition-all duration-200 hover:border-primary hover:bg-secondary/30 hover:shadow-xl">
          <CardContent className="flex h-full flex-col items-center justify-center p-6">
            <div className="my-8 flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                Create New Project
              </h3>
              <p className="text-sm text-muted-foreground">
                Start a new collection of boards
              </p>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
    </CreateProjectDialog>
  );
}
