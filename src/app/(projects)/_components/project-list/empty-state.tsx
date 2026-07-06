import { FolderKanbanIcon, Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";

import { CreateProjectDialog } from "../create-project-dialog";

export function EmptyState() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center border border-dashed border-border py-16 text-center">
      <FolderKanbanIcon className="mb-4 h-8 w-8 text-muted-foreground/60" />
      <h2 className="text-2xl font-light tracking-tight">No projects yet</h2>
      <p className="mb-6 mt-2 max-w-sm text-sm text-muted-foreground">
        Create your first project to start organizing boards and collaborating
        with your team.
      </p>
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
