"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { ColorPicker } from "~/components/ui/color-picker";
import { DialogFooter } from "~/components/ui/dialog";
import { FormMessage } from "~/components/ui/form";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Form, FormField } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useCreateBoard } from "~/lib/hooks";
import { useIsAdmin } from "~/lib/hooks/project-user/use-is-admin";

const formSchema = z.object({
  name: z.string().min(1, "Board name is required"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateBoardFormProps {
  projectId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CreateBoardForm({
  projectId,
  open,
  setOpen,
}: CreateBoardFormProps) {
  const isAdmin = useIsAdmin();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "",
    },
  });

  const createBoardMutation = useCreateBoard();

  async function onSubmit(values: FormValues) {
    if (!isAdmin) return;

    await createBoardMutation.mutateAsync({
      projectId,
      name: values.name,
      color: values.color,
    });
    setOpen(false);
  }

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <div>
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
                    placeholder="E.g. Event Planning"
                    autoComplete="off"
                    {...field}
                    disabled={!isAdmin}
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
                    disabled={!isAdmin}
                  />
                </FormControl>
                <FormDescription>
                  The color is used to easily identify the board.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createBoardMutation.isPending}
              disabled={!isAdmin}
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}
