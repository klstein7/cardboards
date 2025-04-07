"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import { CreateCardFormWithAI } from "./create-card-form-with-ai";

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
          <DialogTitle>Create card</DialogTitle>
          <DialogDescription>
            Add a card to organize and track your tasks within this column.
          </DialogDescription>
        </DialogHeader>

        <CreateCardFormWithAI
          columnId={columnId}
          open={open}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  );
}
