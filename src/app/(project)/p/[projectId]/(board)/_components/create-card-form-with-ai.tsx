"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Tag, TagInput } from "emblor";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";

import { ProjectUserSelect } from "~/app/(project)/_components/project-user-select";
import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
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
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Tiptap } from "~/components/ui/tiptap";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { useCreateCard, useIsMobile } from "~/lib/hooks";
import {
  type CardCreate,
  CardCreateSchema,
  type GeneratedCardSchema,
} from "~/server/zod";

import { CardAIGenerator } from "./card-ai-generator";
import { CardPrioritySelect } from "./card-priority-select";

interface CreateCardFormWithAIProps {
  columnId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CreateCardFormWithAI({
  columnId,
  open,
  setOpen,
}: CreateCardFormWithAIProps) {
  const isMobile = useIsMobile();

  // UI state
  const [showDetails, setShowDetails] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

  // Form-related state
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

  // Handle AI-generated card data
  const handleGeneratedCard = (card: z.infer<typeof GeneratedCardSchema>) => {
    // Fill the form with the generated data
    form.setValue("title", card.title);
    form.setValue("description", card.description);

    // Convert priority to correct format
    const priorityValue = card.priority.toLowerCase();
    if (
      priorityValue === "low" ||
      priorityValue === "medium" ||
      priorityValue === "high" ||
      priorityValue === "urgent"
    ) {
      form.setValue("priority", priorityValue);
    }

    // Convert labels to tags format
    const newTags = card.labels.map((label) => ({
      id: label,
      text: label,
    }));
    setTags(newTags);
    form.setValue("labels", newTags as [Tag, ...Tag[]]);

    // Automatically show details when content is generated
    setShowDetails(true);
  };

  useEffect(() => {
    if (!open) {
      form.reset();
      setTags([]);
      setShowDetails(false);
      setShowMetadata(false);
    }
  }, [open, form]);

  return (
    <div className="space-y-5">
      {/* AI Generation Component */}
      <CardAIGenerator onGeneratedCard={handleGeneratedCard} />

      {/* Form with improved styling */}
      <Form {...form}>
        <form
          id="create-card-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          {/* Title section with enhanced styling */}
          <div className="rounded-lg border border-border/30 bg-card p-3 shadow-sm sm:p-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-base font-medium">
                    <div className="h-1.5 w-1.5 rounded-full bg-foreground/70"></div>
                    Title
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="mt-1.5 resize-none border-input/60 shadow-sm focus-visible:ring-primary/20"
                      rows={2}
                      placeholder="e.g. Add a login with Google button to the login page"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="mt-1.5 text-xs">
                    What do you want to call this card?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Collapsible Details Section with improved styling */}
          <div className="overflow-hidden rounded-lg border border-border/30 bg-card shadow-sm transition-all duration-300">
            <button
              type="button"
              className="flex w-full items-center justify-between p-3 text-sm font-medium transition-colors hover:bg-muted/30 sm:p-4"
              onClick={() => setShowDetails(!showDetails)}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`transition-transform duration-200 ${showDetails ? "rotate-90" : ""}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </div>
                <span className="text-base">Description & Details</span>
              </div>
              <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                {showDetails ? "Hide" : "Show"}
              </span>
            </button>

            {showDetails && (
              <div className="space-y-5 border-t p-3 duration-300 animate-in slide-in-from-top-5 sm:p-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-foreground/70"></div>
                        Description
                      </FormLabel>
                      <FormControl>
                        <Tiptap
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription className="mt-1.5 text-xs">
                        Add more details about this card.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Collapsible Metadata Section */}
                <div className="overflow-hidden rounded-md border border-border/40 bg-muted/20">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between p-3 text-sm font-medium transition-colors hover:bg-muted/30"
                    onClick={() => setShowMetadata(!showMetadata)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`transition-transform duration-200 ${showMetadata ? "rotate-90" : ""}`}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                      <span>Additional metadata</span>
                    </div>
                    <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                      {showMetadata ? "Hide" : "Show"}
                    </span>
                  </button>

                  {showMetadata && (
                    <div className="space-y-4 border-t p-3 duration-200 animate-in slide-in-from-top-3 sm:p-4">
                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <div className="h-1 w-1 rounded-full bg-foreground/70"></div>
                              Due date
                            </FormLabel>
                            <FormControl>
                              <DatePicker
                                {...field}
                                value={field.value ?? undefined}
                              />
                            </FormControl>
                            <FormDescription className="mt-1 text-xs">
                              When should this be completed?
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="assignedToId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <div className="h-1 w-1 rounded-full bg-foreground/70"></div>
                                Assignee
                              </FormLabel>
                              <FormControl>
                                <ProjectUserSelect
                                  value={field.value ?? ""}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormDescription className="mt-1 text-xs">
                                Who is responsible for this task?
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
                              <FormLabel className="flex items-center gap-2">
                                <div className="h-1 w-1 rounded-full bg-foreground/70"></div>
                                Priority
                              </FormLabel>
                              <FormControl>
                                <CardPrioritySelect
                                  value={field.value ?? "low"}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormDescription className="mt-1 text-xs">
                                How important is this task?
                              </FormDescription>
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
                            <FormLabel className="flex items-center gap-2">
                              <div className="h-1 w-1 rounded-full bg-foreground/70"></div>
                              Labels
                            </FormLabel>
                            <FormControl className="w-full">
                              <TagInput
                                {...field}
                                className="min-w-full sm:min-w-[450px]"
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
                                  form.setValue(
                                    "labels",
                                    newTags as [Tag, ...Tag[]],
                                  );
                                }}
                              />
                            </FormControl>
                            <FormDescription className="mt-1 text-xs">
                              Add tags to categorize this card.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 flex justify-end gap-3 border-t border-border/30 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 sm:px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createCardMutation.isPending}
              className="bg-primary/90 px-5 font-medium shadow-sm hover:bg-primary sm:px-6"
            >
              Create
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
