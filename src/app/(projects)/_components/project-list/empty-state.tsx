import { motion } from "framer-motion";
import { FolderKanbanIcon, Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";

import { CreateProjectDialog } from "../create-project-dialog";

export function EmptyState() {
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
