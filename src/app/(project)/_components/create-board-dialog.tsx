"use client";

import { Lock, Sparkles, Wrench } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useIsAdmin } from "~/lib/hooks/project-user/use-is-admin";

import { CreateBoardForm } from "./create-board-form";
import { GenerateBoardForm } from "./generate-board-form";

interface CreateBoardDialogProps {
  trigger: React.ReactNode;
  projectId: string;
}

export function CreateBoardDialog({
  trigger,
  projectId,
}: CreateBoardDialogProps) {
  const [open, setOpen] = useState(false);
  const isAdmin = useIsAdmin();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new board</DialogTitle>
          <DialogDescription>
            A board is a collection of columns and cards to manage your project.
          </DialogDescription>
        </DialogHeader>
        {!isAdmin ? (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Admin access required</h3>
            <p className="text-sm text-muted-foreground">
              Only administrators can create new boards for this project.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="auto" className="w-full">
            <TabsList>
              <TabsTrigger value="auto">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4" />
                  Create with AI
                </div>
              </TabsTrigger>
              <TabsTrigger value="manual">
                <div className="flex items-center gap-2">
                  <Wrench className="size-4" />
                  Manual
                </div>
              </TabsTrigger>
            </TabsList>
            <TabsContent className="pt-2" value="auto">
              <GenerateBoardForm
                projectId={projectId}
                open={open}
                setOpen={setOpen}
              />
            </TabsContent>
            <TabsContent className="pt-2" value="manual">
              <CreateBoardForm
                open={open}
                projectId={projectId}
                setOpen={setOpen}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
