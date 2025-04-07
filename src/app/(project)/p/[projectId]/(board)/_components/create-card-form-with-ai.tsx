"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Tag, TagInput } from "emblor";
import { CheckCircle2, ChevronRight, Info, Sparkles, Zap } from "lucide-react";
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
import { useCreateCard, useGenerateSingleCard } from "~/lib/hooks";
import { useStrictCurrentBoardId } from "~/lib/hooks/utils";
import {
  type CardCreate,
  CardCreateSchema,
  type GeneratedCardSchema,
} from "~/server/zod";

import { CardPrioritySelect } from "./card-priority-select";

// Task types for AI generation
const TASK_TYPES = ["Planning", "Task", "Review"] as const;
type TaskType = (typeof TASK_TYPES)[number];

// Detail levels for AI generation
const DETAIL_LEVELS = ["High-Level", "Standard", "Detailed"] as const;
type DetailLevel = (typeof DETAIL_LEVELS)[number];

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
  const boardId = useStrictCurrentBoardId();

  // AI-related state
  const [goal, setGoal] = useState("");
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType | null>(
    null,
  );
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("Standard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<z.infer<
    typeof GeneratedCardSchema
  > | null>(null);

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
  const generateCardMutation = useGenerateSingleCard();

  const onSubmit = async (data: CardCreate) => {
    await createCardMutation.mutateAsync(data);
    setOpen(false);
    form.reset();
  };

  // Generate a card using AI and fill the form with its data
  const handleGenerate = async () => {
    if (!goal.trim() || !boardId) return;

    setIsGenerating(true);
    setGeneratedCard(null);

    try {
      const card = await generateCardMutation.mutateAsync({
        prompt: goal.trim(),
        focusType: selectedTaskType?.toLowerCase() as
          | "planning"
          | "task"
          | "review"
          | undefined,
        detailLevel,
        boardId,
      });

      // If we have a card, fill the form with it
      if (card) {
        setGeneratedCard(card);

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
      }
    } catch (error) {
      console.error("Error generating card:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!open) {
      form.reset();
      setGoal("");
      setSelectedTaskType(null);
      setDetailLevel("Standard");
      setGeneratedCard(null);
      setTags([]);
      setShowDetails(false);
      setShowMetadata(false);
    }
  }, [open, form]);

  return (
    <div className="space-y-6">
      {/* AI Generation Section with improved visuals */}
      <div
        className={`relative overflow-hidden rounded-lg border ${
          generatedCard
            ? "border-primary/50 bg-gradient-to-r from-primary/10 via-primary/5 to-muted/30 shadow-md"
            : "border-primary/20 bg-gradient-to-r from-primary/5 via-background to-muted/20"
        } group transition-all duration-500 hover:shadow-md`}
      >
        {/* Animated background grid with better masking */}
        <div className="bg-grid-primary/5 absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)]"></div>

        {/* Subtle glow effect when content is generated */}
        {generatedCard && (
          <div className="animate-pulse-slow absolute inset-0 rounded-lg bg-primary/5 opacity-30"></div>
        )}

        <div className="relative p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-medium text-foreground/90">
              {generatedCard ? (
                <Zap className="h-4 w-4 animate-pulse text-primary" />
              ) : (
                <Sparkles className="animate-pulse-slow h-4 w-4 text-primary opacity-80" />
              )}
              <span className="bg-gradient-to-r from-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                AI Assistant
              </span>
            </h3>

            {generatedCard && (
              <div className="inline-flex items-center rounded-full border border-green-200/30 bg-green-100/20 px-3 py-0.5 text-xs font-medium text-green-700 shadow-sm dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle2 className="mr-1.5 h-3 w-3" />
                Content generated
              </div>
            )}
          </div>

          <div className="space-y-4">
            {generatedCard ? (
              <div className="rounded-md border border-border/40 bg-card/80 p-3 text-sm shadow-sm backdrop-blur-sm">
                <div className="flex gap-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                  <div>
                    <p className="font-medium text-foreground">
                      AI has populated your form
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Your card has been created with AI-generated content based
                      on your input. Feel free to review and edit any fields
                      before creating the card.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="goal" className="text-sm font-medium">
                      Describe your task
                    </Label>
                    <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                      AI will generate all fields
                    </span>
                  </div>
                  <div className="group/input relative">
                    <Input
                      id="goal"
                      value={goal}
                      placeholder="Example: Create login page, Design user profile, Fix navigation bug..."
                      className="border-border/40 pr-10 shadow-sm transition-all focus-visible:border-primary/40 focus-visible:ring-primary/20"
                      onChange={(e) => setGoal(e.target.value)}
                    />
                    <Sparkles className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/30 transition-all group-hover/input:text-primary/60" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <div className="h-1 w-1 rounded-full bg-primary/60"></div>
                      Focus type
                    </Label>
                    <ToggleGroup
                      type="single"
                      size="sm"
                      variant="outline"
                      value={selectedTaskType ?? ""}
                      onValueChange={(value) => {
                        setSelectedTaskType((value as TaskType) || null);
                      }}
                      className="w-full rounded-md border-border/40 shadow-sm"
                    >
                      {TASK_TYPES.map((type) => (
                        <ToggleGroupItem
                          key={type}
                          value={type}
                          className="flex-1 rounded text-xs transition-colors data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                        >
                          {type}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <div className="h-1 w-1 rounded-full bg-primary/60"></div>
                      Detail level
                    </Label>
                    <ToggleGroup
                      type="single"
                      size="sm"
                      variant="outline"
                      value={detailLevel}
                      onValueChange={(value) => {
                        if (
                          value &&
                          DETAIL_LEVELS.includes(value as DetailLevel)
                        ) {
                          setDetailLevel(value as DetailLevel);
                        }
                      }}
                      className="w-full rounded-md border-border/40 shadow-sm"
                    >
                      {DETAIL_LEVELS.map((level) => (
                        <ToggleGroupItem
                          key={level}
                          value={level}
                          className="flex-1 rounded text-xs transition-colors data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                        >
                          {level}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full bg-gradient-to-r from-primary/80 to-primary font-medium text-primary-foreground shadow transition-all duration-300 hover:from-primary hover:to-primary/90"
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  disabled={!goal.trim() || isGenerating}
                >
                  {!isGenerating && <Sparkles className="mr-2 h-3.5 w-3.5" />}
                  {!isGenerating && "Generate with AI"}
                </Button>
              </>
            )}

            {generatedCard && (
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs hover:bg-primary/5"
                  onClick={() => {
                    setGeneratedCard(null);
                  }}
                >
                  <Sparkles className="mr-1.5 h-3 w-3 text-primary/70" />
                  Generate again
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form with improved styling */}
      <Form {...form}>
        <form
          id="create-card-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          {/* Title section with enhanced styling */}
          <div className="rounded-lg border border-border/30 bg-card p-4 shadow-sm">
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
              className="flex w-full items-center justify-between p-4 text-sm font-medium transition-colors hover:bg-muted/30"
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
              <div className="space-y-5 border-t p-4 duration-300 animate-in slide-in-from-top-5">
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
                    <div className="space-y-4 border-t p-4 duration-200 animate-in slide-in-from-top-3">
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

                      <div className="grid grid-cols-2 gap-4">
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

          <div className="mt-2 flex justify-end gap-3 border-t border-border/30 pt-5">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              className="px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createCardMutation.isPending}
              className="bg-primary/90 px-6 font-medium shadow-sm hover:bg-primary"
            >
              Create
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
