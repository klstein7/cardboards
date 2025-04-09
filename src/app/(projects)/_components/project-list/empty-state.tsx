import { motion } from "framer-motion";
import { FolderKanbanIcon, LightbulbIcon, Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { DialogTrigger } from "~/components/ui/dialog";

import { CreateProjectDialog } from "../create-project-dialog";

export function EmptyState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-10">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 border-dashed">
          <CardHeader className="flex flex-row items-center justify-center pt-8">
            <motion.div
              className="rounded-full bg-primary/10 p-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <FolderKanbanIcon className="h-12 w-12 text-primary" />
            </motion.div>
          </CardHeader>
          <CardContent className="px-8 pb-4 pt-4 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Welcome to Cardboards
            </h2>
            <p className="mt-3 text-muted-foreground">
              Create your first project to get started with your kanban boards.
              Projects help you organize your work and collaborate with team
              members.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <CreateProjectDialog>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2 font-medium">
                  <Plus className="h-5 w-5" />
                  <span>Create Your First Project</span>
                </Button>
              </DialogTrigger>
            </CreateProjectDialog>
          </CardFooter>
        </Card>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex-shrink-0 rounded-full bg-amber-100 p-2 dark:bg-amber-900/30">
            <LightbulbIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Pro tip:</span>{" "}
            Projects can be used for teams, departments, or personal workspaces.
            Create a structure that works best for your workflow.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
