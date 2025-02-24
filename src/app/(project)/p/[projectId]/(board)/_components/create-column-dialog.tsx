"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useCreateColumn } from "~/lib/hooks";
import { type ColumnCreate, ColumnCreateSchema } from "~/server/zod";

interface CreateColumnDialogProps {
  boardId: string;
}

export function CreateColumnDialog({ boardId }: CreateColumnDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<ColumnCreate>({
    resolver: zodResolver(ColumnCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      boardId,
    },
  });

  const createColumnMutation = useCreateColumn();

  async function onSubmit(data: ColumnCreate) {
    await createColumnMutation.mutateAsync(data);
    setOpen(false);
  }

  console.log(form.formState.errors);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 bg-muted/25 py-6 hover:bg-muted/50"
        >
          <Plus className="size-4" />
          Add column
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a new column</DialogTitle>
          <DialogDescription>
            Columns help organize your tasks in different stages.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="create-column-form"
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g. To Do"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>The name of the column.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="E.g. Tasks that need to be worked on"
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of this column&apos;s purpose. This will
                    be used to guide the AI when creating cards.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-column-form"
            isLoading={createColumnMutation.isPending}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
