"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

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
import { useCreateProject } from "~/lib/hooks";
import { type ProjectCreate, ProjectCreateSchema } from "~/server/zod";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<ProjectCreate>({
    resolver: zodResolver(ProjectCreateSchema),
    defaultValues: {
      name: "",
    },
  });

  const createProjectMutation = useCreateProject();

  async function onSubmit(data: ProjectCreate) {
    await createProjectMutation.mutateAsync(data);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-auto w-full max-w-[450px] rounded-lg border-2 border-dashed bg-background p-8 hover:border-primary hover:bg-secondary/10"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-2.5">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-medium text-muted-foreground">
              Create new project
            </span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
          <DialogDescription>
            A project is a collection of boards.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="create-project-form"
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
                      placeholder="E.g. Creating the login page"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>The name of the project.</FormDescription>
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
            form="create-project-form"
            isLoading={createProjectMutation.isPending}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
