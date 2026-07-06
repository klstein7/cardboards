"use client";

import { Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";

import { CreateProjectDialog } from "./create-project-dialog";

export function ProjectsTitle() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Workspace
        </p>
        <h1 className="mt-2 text-4xl font-extralight tracking-tight md:text-5xl">
          Projects
        </h1>
      </div>
      <CreateProjectDialog>
        <DialogTrigger asChild>
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" />
            New project
          </Button>
        </DialogTrigger>
      </CreateProjectDialog>
    </div>
  );
}
