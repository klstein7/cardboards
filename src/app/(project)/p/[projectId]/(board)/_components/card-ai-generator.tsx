"use client";

import { Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { type z } from "zod";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { useGenerateSingleCard, useIsMobile } from "~/lib/hooks";
import { useStrictCurrentBoardId } from "~/lib/hooks/utils";
import { type GeneratedCardSchema } from "~/server/zod";

const TASK_TYPES = ["Planning", "Task", "Review"] as const;
type TaskType = (typeof TASK_TYPES)[number];

const DETAIL_LEVELS = ["High-Level", "Standard", "Detailed"] as const;
type DetailLevel = (typeof DETAIL_LEVELS)[number];

export interface CardAIGeneratorProps {
  onGeneratedCard: (card: z.infer<typeof GeneratedCardSchema>) => void;
}

export function CardAIGenerator({ onGeneratedCard }: CardAIGeneratorProps) {
  const boardId = useStrictCurrentBoardId();
  const isMobile = useIsMobile();

  const [goal, setGoal] = useState("");
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType | null>(
    null,
  );
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("Standard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<z.infer<
    typeof GeneratedCardSchema
  > | null>(null);

  const generateCardMutation = useGenerateSingleCard();

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

      if (card) {
        setGeneratedCard(card);
        onGeneratedCard(card);
      }
    } catch (error) {
      console.error("Error generating card:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAgain = () => {
    setGeneratedCard(null);
  };

  return (
    <div
      className={`rounded-lg border ${
        generatedCard
          ? "border-primary/20 bg-primary/5"
          : "border-border bg-background"
      }`}
    >
      <div className="p-4">
        {/* Content */}
        {generatedCard ? (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-medium">AI-Generated Content</span>
            </div>

            <div className="text-xs text-muted-foreground">
              Your card has been created with AI. Review and edit the details
              below.
            </div>

            <Button
              size="sm"
              variant="outline"
              className="mt-1 h-7 w-full text-xs"
              onClick={handleGenerateAgain}
            >
              <Sparkles className="mr-1.5 h-3 w-3 text-primary/70" />
              Generate different content
            </Button>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary/80" />
              <span className="text-sm font-medium">AI Card Generator</span>
            </div>

            <Input
              value={goal}
              placeholder="Describe what you want to create..."
              className="border-input/60 text-sm"
              onChange={(e) => setGoal(e.target.value)}
            />

            <div className="mb-3 grid grid-cols-2 gap-2.5">
              <div>
                <Label className="mb-1.5 block text-xs text-muted-foreground">
                  Type
                </Label>
                <ToggleGroup
                  type="single"
                  size="sm"
                  variant="outline"
                  value={selectedTaskType ?? ""}
                  onValueChange={(value) =>
                    setSelectedTaskType((value as TaskType) || null)
                  }
                  className="w-full bg-background"
                >
                  {TASK_TYPES.map((type) => (
                    <ToggleGroupItem
                      key={type}
                      value={type}
                      className="flex-1 text-xs data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                    >
                      {type}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <div>
                <Label className="mb-1.5 block text-xs text-muted-foreground">
                  Detail
                </Label>
                <ToggleGroup
                  type="single"
                  size="sm"
                  variant="outline"
                  value={detailLevel}
                  onValueChange={(value) => {
                    if (value && DETAIL_LEVELS.includes(value as DetailLevel)) {
                      setDetailLevel(value as DetailLevel);
                    }
                  }}
                  className="w-full bg-background"
                >
                  {DETAIL_LEVELS.map((level) => (
                    <ToggleGroupItem
                      key={level}
                      value={level}
                      className="flex-1 text-xs data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                    >
                      {level === "High-Level" && isMobile ? "High" : level}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>

            <Button
              size="sm"
              className="w-full text-xs font-medium"
              onClick={handleGenerate}
              isLoading={isGenerating}
              disabled={!goal.trim() || isGenerating}
            >
              {!isGenerating && <Sparkles className="mr-1.5 h-3 w-3" />}
              {!isGenerating && "Generate with AI"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
