"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { ColorPicker } from "~/components/ui/color-picker";
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
import { useUpdateBoard } from "~/lib/hooks";
import { useIsAdmin } from "~/lib/hooks/project-user/use-is-admin";

const formSchema = z.object({
  name: z.string().min(1, "Board name is required"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
});

type FormValues = z.infer<typeof formSchema>;

interface EditableBoard {
  id: string;
  name: string;
  color: string;
}

interface EditBoardDialogProps {
  board: EditableBoard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBoardDialog({
  board,
  open,
  onOpenChange,
}: EditBoardDialogProps) {
  const isAdmin = useIsAdmin();
  const updateBoardMutation = useUpdateBoard();
  const isSaving = updateBoardMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: board.name,
      color: board.color,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: board.name,
        color: board.color,
      });
    }
  }, [board.color, board.name, form, open]);

  async function onSubmit(values: FormValues) {
    if (!isAdmin) return;

    try {
      await updateBoardMutation.mutateAsync({
        boardId: board.id,
        data: values,
      });
      toast.success("Board updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update board", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSaving) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit board</DialogTitle>
          <DialogDescription>
            Update the board name and color used throughout the project.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g. Product roadmap"
                      autoComplete="off"
                      {...field}
                      disabled={!isAdmin || isSaving}
                    />
                  </FormControl>
                  <FormDescription>
                    What do you want to call this board?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <ColorPicker
                      color={field.value}
                      onChange={field.onChange}
                      disabled={!isAdmin || isSaving}
                    />
                  </FormControl>
                  <FormDescription>
                    The color is used to identify this board.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving} disabled={!isAdmin}>
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
