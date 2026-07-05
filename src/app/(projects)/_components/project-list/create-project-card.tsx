import { Plus } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
import { DialogTrigger } from "~/components/ui/dialog";

import { CreateProjectDialog } from "../create-project-dialog";

export function CreateProjectCard() {
  return (
    <CreateProjectDialog>
      <DialogTrigger asChild>
        <Card className="group h-full cursor-pointer border-dashed border-border bg-transparent transition-colors duration-150 hover:border-primary/50">
          <CardContent className="flex h-full flex-col items-center justify-center p-5">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="border border-primary/40 p-2.5 transition-colors group-hover:border-primary">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
                  New Project
                </h3>
                <p className="text-xs text-muted-foreground/90">
                  Create a new collection of boards
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
    </CreateProjectDialog>
  );
}
