"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { type Column } from "~/app/(project)/_types";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { useUpdateColumn } from "~/lib/hooks";
import { type ColumnUpdatePayload } from "~/server/zod";

const EditColumnSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isCompleted: z.boolean(),
});

interface EditColumnDialogProps {
  column: Column;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditColumnDialog({
  column,
  open,
  onOpenChange,
}: EditColumnDialogProps) {
  const form = useForm<ColumnUpdatePayload>({
    resolver: zodResolver(EditColumnSchema),
    defaultValues: {
      name: column.name,
      description: column.description ?? "",
      isCompleted: column.isCompleted,
    },
  });

  const updateColumnMutation = useUpdateColumn();

  async function onSubmit(values: ColumnUpdatePayload) {
    await updateColumnMutation.mutateAsync({
      columnId: column.id,
      data: values,
    });
    onOpenChange(false);
  }

  useEffect(() => {
    form.reset({
      name: column.name,
      description: column.description ?? "",
      isCompleted: column.isCompleted,
    });
  }, [open, column, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit column</DialogTitle>
          <DialogDescription>
            Change the properties of the column.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="edit-column-form"
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
                      placeholder="E.g. In Progress"
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
                      placeholder="E.g. Tasks currently being worked on"
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

            <FormField
              control={form.control}
              name="isCompleted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Completed Column</FormLabel>
                    <FormDescription>
                      Mark this column as representing completed tasks
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-column-form"
            isLoading={updateColumnMutation.isPending}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
