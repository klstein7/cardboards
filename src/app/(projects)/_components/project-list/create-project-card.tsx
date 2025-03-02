import { Plus } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
import { DialogTrigger } from "~/components/ui/dialog";

import { CreateProjectDialog } from "../create-project-dialog";

export function CreateProjectCard() {
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
