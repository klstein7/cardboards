"use client";

import { Sparkles, Wrench } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

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
      </DialogContent>
    </Dialog>
  );
}
