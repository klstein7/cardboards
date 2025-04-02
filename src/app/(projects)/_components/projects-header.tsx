"use client";

import { PlusIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";

import { CreateProjectDialog } from "./create-project-dialog";

export function ProjectsHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage and organize your projects
        </p>
      </div>
      <div>
        <CreateProjectDialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
        </CreateProjectDialog>
      </div>
    </div>
  );
}
