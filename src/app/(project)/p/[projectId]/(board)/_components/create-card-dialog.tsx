"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Tag, TagInput } from "emblor";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { ProjectUserSelect } from "~/app/(project)/_components/project-user-select";
import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
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
import { Textarea } from "~/components/ui/textarea";
import { Tiptap } from "~/components/ui/tiptap";
import { useCreateCard } from "~/lib/hooks";
import { type CardCreate, CardCreateSchema } from "~/server/zod";

import { CardPrioritySelect } from "./card-priority-select";

interface CreateCardDialogProps {
  columnId: string;
  trigger: React.ReactNode;
}

export function CreateCardDialog({ columnId, trigger }: CreateCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  const form = useForm<CardCreate>({
    resolver: zodResolver(CardCreateSchema),
    defaultValues: {
      title: "",
      columnId,
      labels: [],
      priority: "low",
      dueDate: undefined,
    },
  });

  const createCardMutation = useCreateCard();

  const onSubmit = async (data: CardCreate) => {
    await createCardMutation.mutateAsync(data);
    setOpen(false);
    form.reset();
  };

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open]);

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
        <Form {...form}>
          <form
            id="create-card-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-4">
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
                      <Tiptap
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      A detailed description of the card.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due date</FormLabel>
                  <FormControl>
                    <DatePicker {...field} value={field.value ?? undefined} />
                  </FormControl>
                  <FormDescription>The due date for the card.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assignedToId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <FormControl>
                      <ProjectUserSelect
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      The user responsible for this card.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <CardPrioritySelect
                        value={field.value ?? "low"}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>The priority of the card.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="labels"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col items-start">
                  <FormLabel>Labels</FormLabel>
                  <FormControl className="w-full">
                    <TagInput
                      {...field}
                      className="sm:min-w-[450px]"
                      styleClasses={{
                        input: "h-9",
                        inlineTagsContainer: "pl-1 py-0.5",
                      }}
                      activeTagIndex={activeTagIndex}
                      setActiveTagIndex={setActiveTagIndex}
                      placeholder="Enter a topic"
                      tags={tags}
                      maxTags={5}
                      setTags={(newTags) => {
                        setTags(newTags);
                        form.setValue("labels", newTags as [Tag, ...Tag[]]);
                      }}
                    />
                  </FormControl>
                  <FormDescription>Labels for the card.</FormDescription>
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
