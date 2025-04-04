"use client";

import { Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { useCreateManyCards, useGenerateCards } from "~/lib/hooks";
import { type Priority } from "~/lib/utils";
import { cn } from "~/lib/utils";
import { type CardGenerateResponse, GeneratedCardSchema } from "~/server/zod";

import { CardSkeleton } from "./card-skeleton";
import { GeneratedCardPreview } from "./generated-card-preview";

interface GenerateCardFormProps {
  columnId: string;
  setOpen: (open: boolean) => void;
}

// Updated Task Types for general accessibility
const TASK_TYPES = ["Planning", "Task", "Review"] as const;
type TaskType = (typeof TASK_TYPES)[number];

// Added Detail Levels
const DETAIL_LEVELS = ["High-Level", "Standard", "Detailed"] as const;
type DetailLevel = (typeof DETAIL_LEVELS)[number];

const MAX_RECENT_GOALS = 3;

export function GenerateCardForm({ columnId, setOpen }: GenerateCardFormProps) {
  const params = useParams();
  const [goal, setGoal] = useState("");
  const [recentGoals, setRecentGoals] = useState<string[]>([]);
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType | null>(
    null,
  );
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("Standard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [generatedCards, setGeneratedCards] = useState<
    CardGenerateResponse["cards"]
  >([]);

  // Get board ID from route params
  const boardId = typeof params.boardId === "string" ? params.boardId : "";

  const createManyCardsMutation = useCreateManyCards();
  const generateCardsMutation = useGenerateCards();

  const handleGenerate = async () => {
    if (!goal.trim() || !boardId) return;

    setIsGenerating(true);
    setGeneratedCards([]);

    // Add goal to recent goals before generating
    setRecentGoals((prev) => {
      const newGoal = goal.trim();
      if (!newGoal || prev.includes(newGoal)) return prev;
      return [newGoal, ...prev].slice(0, MAX_RECENT_GOALS);
    });

    try {
      const cards = await generateCardsMutation.mutateAsync({
        prompt: goal.trim(),
        focusType: selectedTaskType?.toLowerCase() as
          | "planning"
          | "task"
          | "review"
          | undefined,
        detailLevel,
        boardId,
      });

      // Process the cards and update state
      if (cards && cards.length > 0) {
        const validCards = cards
          .map((card) => {
            const result = GeneratedCardSchema.safeParse(card);
            return result.success ? result.data : null;
          })
          .filter(
            (card): card is CardGenerateResponse["cards"][0] => card !== null,
          );

        setGeneratedCards(validCards);
      }
    } catch (error) {
      console.error("Error generating cards:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCards = async () => {
    await createManyCardsMutation.mutateAsync({
      boardId,
      data: generatedCards
        .filter((_, index) => selectedCards.includes(index))
        .map((card) => ({
          title: card.title,
          description: card.description,
          priority: card.priority as Priority["value"],
          columnId,
          labels: card.labels.map((label) => ({
            id: label,
            text: label,
          })),
        })),
    });
    setOpen(false);
  };

  useEffect(() => {
    return () => {
      setGoal("");
      setSelectedTaskType(null);
      setDetailLevel("Standard");
      setGeneratedCards([]);
      setSelectedCards([]);
    };
  }, []);

  // Function to handle clicking a recent goal
  const handleRecentGoalClick = (recentGoal: string) => {
    setGoal(recentGoal);
  };

  return (
    <div className="flex flex-col gap-6 text-foreground/90">
      {/* Header with shine effect */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-card to-muted p-4">
        <div className="bg-grid-primary/5 absolute inset-0 [mask-image:linear-gradient(to_bottom_right,white,transparent,white)]" />
        <div className="relative flex flex-col space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Create Tasks</h2>
          <p className="text-sm text-muted-foreground">
            Generate intelligent task suggestions based on your goals
          </p>
        </div>
      </div>

      {/* Section 1: Goal Input */}
      <Card className="overflow-hidden">
        <CardContent className="p-4 pt-4">
          <div className="space-y-3">
            <Label htmlFor="goal" className="text-sm font-medium">
              Feature or Goal
            </Label>
            <div className="relative">
              <Input
                id="goal"
                value={goal}
                placeholder="Example: Plan Marketing Campaign, Write Blog Post, Household Chores..."
                className="pr-10 shadow-sm"
                onChange={(e) => setGoal(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter the main goal or activity you want to break down into tasks.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Filters & Recents - Grouped */}
      <Card>
        <CardContent className="p-4 pt-4">
          <div className="space-y-5">
            {/* Optional Task Type Filters - Using ToggleGroup */}
            <div className="space-y-2.5">
              <Label className="text-sm font-medium">Focus</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                value={selectedTaskType ?? ""}
                onValueChange={(value) => {
                  setSelectedTaskType((value as TaskType) || null);
                }}
                className="flex w-full justify-between rounded-md border border-border/60 p-1 shadow-sm"
              >
                {TASK_TYPES.map((type) => (
                  <ToggleGroupItem
                    key={type}
                    value={type}
                    size="sm"
                    className="flex-1 rounded data-[state=on]:border-primary/30 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                  >
                    {type}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <p className="text-xs text-muted-foreground">
                {selectedTaskType === "Planning" &&
                  "Focus on project preparation and strategy"}
                {selectedTaskType === "Task" &&
                  "Focus on actionable work items"}
                {selectedTaskType === "Review" &&
                  "Focus on evaluation and quality checks"}
                {!selectedTaskType && "Select a focus area (optional)"}
              </p>
            </div>

            {/* Replace Recent Goals with Level of Detail selector */}
            <div className="space-y-2.5 border-t border-border/30 pt-5">
              <Label className="text-sm font-medium">Level of Detail</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                value={detailLevel}
                onValueChange={(value) => {
                  if (value && DETAIL_LEVELS.includes(value as DetailLevel)) {
                    setDetailLevel(value as DetailLevel);
                  }
                }}
                className="flex w-full justify-between rounded-md border border-border/60 p-1 shadow-sm"
              >
                {DETAIL_LEVELS.map((level) => (
                  <ToggleGroupItem
                    key={level}
                    value={level}
                    size="sm"
                    className="flex-1 rounded data-[state=on]:border-primary/30 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                  >
                    {level}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <p className="text-xs text-muted-foreground">
                {detailLevel === "High-Level" &&
                  "Generate broad overview tasks"}
                {detailLevel === "Standard" &&
                  "Generate balanced, practical tasks"}
                {detailLevel === "Detailed" &&
                  "Generate specific, granular subtasks"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Generate Button */}
      <Button
        size="lg"
        className="relative w-full overflow-hidden bg-gradient-to-r from-primary/90 to-primary font-medium shadow-md transition-all hover:from-primary hover:to-primary/90"
        onClick={handleGenerate}
        isLoading={isGenerating}
        disabled={!goal.trim() || isGenerating}
      >
        {!isGenerating && (
          <>
            <span className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="-ml-1 mr-2 h-4 w-4" />
            </span>
            <span className="ml-4">
              {isGenerating ? "Generating ideas..." : "Generate cards"}
            </span>
          </>
        )}
        {isGenerating && "Generating ideas..."}
      </Button>

      {generatedCards.length > 0 && (
        <div className="mt-4 space-y-6">
          <Separator className="bg-border/40" />

          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                Suggested cards
                <span className="ml-2 text-sm text-muted-foreground">
                  ({generatedCards.length} generated)
                </span>
              </h3>
              <p className="text-sm text-muted-foreground/80">
                Click cards to select/deselect them
              </p>
            </div>
            <Badge
              variant={selectedCards.length > 0 ? "default" : "outline"}
              className="px-3 py-1 text-sm shadow-sm"
            >
              {selectedCards.length} selected
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {generatedCards.map((card, index) => (
              <GeneratedCardPreview
                key={index}
                card={card}
                isSelected={selectedCards.includes(index)}
                onClick={() =>
                  setSelectedCards((prev) => {
                    if (prev.includes(index)) {
                      return prev.filter((id) => id !== index);
                    }
                    return [...prev, index];
                  })
                }
              />
            ))}
            {isGenerating && (
              <>
                <CardSkeleton />
                <CardSkeleton />
              </>
            )}
          </div>

          {!isGenerating && generatedCards.length > 0 && (
            <div className="flex justify-end pt-3">
              <Button
                variant="default"
                className="shadow-sm"
                onClick={handleAddCards}
                isLoading={createManyCardsMutation.isPending}
                disabled={
                  selectedCards.length === 0 ||
                  createManyCardsMutation.isPending
                }
              >
                Add {selectedCards.length} selected cards
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
