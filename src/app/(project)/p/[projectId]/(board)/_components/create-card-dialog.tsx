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

import { CreateCardForm } from "./create-card-form";
import { GenerateCardForm } from "./generate-card-form";

interface CreateCardDialogProps {
  columnId: string;
  trigger: React.ReactNode;
}

export function CreateCardDialog({ columnId, trigger }: CreateCardDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="max-w-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Create a card</DialogTitle>
          <DialogDescription>
            A card is a task that you need to complete.
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

          {/* AI Tab Content */}
          <TabsContent className="pt-4" value="auto">
            <GenerateCardForm columnId={columnId} setOpen={setOpen} />
          </TabsContent>

          {/* Manual Tab Content */}
          <TabsContent className="pt-4" value="manual">
            <CreateCardForm columnId={columnId} open={open} setOpen={setOpen} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
