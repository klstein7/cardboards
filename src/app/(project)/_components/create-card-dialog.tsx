"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { useForm } from "react-hook-form";
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
import { useCreateCard } from "~/lib/hooks";
import { type CardCreate, CardCreateSchema } from "~/server/zod";

interface CreateCardDialogProps {
  columnId: string;
  trigger: React.ReactNode;
}

export function CreateCardDialog({ columnId, trigger }: CreateCardDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<CardCreate>({
    resolver: zodResolver(CardCreateSchema),
    defaultValues: {
      columnId,
    },
  });

  const createCardMutation = useCreateCard();

  const onSubmit = async (data: CardCreate) => {
    await createCardMutation.mutateAsync(data);
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a card</DialogTitle>
          <DialogDescription>
            A card is a task that you need to complete.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="create-card-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      rows={2}
                      placeholder="e.g. Add a login with Google button to the login page"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A concise title for the card.
                  </FormDescription>
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
                      className="resize-none"
                      rows={4}
                      placeholder="e.g. To add a login with Google button to the login page, we need to..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    A detailed description of the card.
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
            form="create-card-form"
            isLoading={createCardMutation.isPending}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
