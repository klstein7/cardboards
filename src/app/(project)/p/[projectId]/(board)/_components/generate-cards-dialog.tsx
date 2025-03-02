"use client";

import { Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { useCreateManyCards, useGenerateCards } from "~/lib/hooks";
import { cn, type Priority } from "~/lib/utils";
import { type CardGenerateResponse, GeneratedCardSchema } from "~/server/zod";

import { CardBase } from "./card-base";
import { CardSkeleton } from "./card-skeleton";

interface GenerateCardsDialogProps {
  boardId: string;
  trigger: React.ReactNode;
}

export function GenerateCardsDialog({
  boardId,
  trigger,
}: GenerateCardsDialogProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [generatedCards, setGeneratedCards] = useState<
    CardGenerateResponse["cards"]
  >([]);

  const createManyCardsMutation = useCreateManyCards();
  const generateCardsMutation = useGenerateCards();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedCards([]);

    try {
      const cards = await generateCardsMutation.mutateAsync({
        prompt,
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
          labels: card.labels.map((label) => ({
            id: label,
            text: label,
          })),
        })),
    });
    setOpen(false);
  };

  useEffect(() => {
    if (!open) {
      setPrompt("");
      setGeneratedCards([]);
      setSelectedCards([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Cards with AI
          </DialogTitle>
          <DialogDescription>
            Describe what you need, and we&apos;ll generate task cards for your
            board.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 pt-2">
          <div className="space-y-3 rounded-lg border bg-card/50 p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="prompt" className="text-sm font-medium">
                What would you like to create cards for?
              </Label>
              <span className="text-xs text-muted-foreground">
                {prompt.length}/500 characters
              </span>
            </div>
            <Textarea
              id="prompt"
              placeholder="Example: 'I need to add user authentication using NextAuth.js with Google and GitHub providers'"
              className="min-h-[120px] resize-none bg-background/50"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
            />
            <Button
              onClick={handleGenerate}
              isLoading={isGenerating}
              variant="default"
              className="w-full"
              disabled={!prompt.trim() || isGenerating}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating ideas..." : "Generate cards"}
            </Button>
          </div>

          {generatedCards.length > 0 && (
            <div className="space-y-4">
              <Separator className="bg-border/50" />

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Suggested cards
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({generatedCards.length} generated)
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Click cards to select/deselect them
                  </p>
                </div>
                <Badge
                  variant={selectedCards.length > 0 ? "default" : "outline"}
                  className="px-3 py-1 text-sm"
                >
                  {selectedCards.length} selected
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {generatedCards.map((card, index) => (
                  <CardBase
                    key={index}
                    card={{
                      id: index,
                      title: card.title,
                      description: card.description,
                      createdAt: new Date(),
                      labels: card.labels,
                      priority: card.priority as Priority["value"],
                      columnId: "1",
                      assignedTo: null,
                      order: 0,
                      dueDate: null,
                      assignedToId: null,
                      updatedAt: null,
                    }}
                    className={cn(
                      "relative cursor-pointer transition-all hover:shadow-md",
                      "border border-border/75",
                      selectedCards.includes(index) && [
                        "ring-2 ring-primary",
                        "border-primary",
                        "bg-primary/5 dark:bg-primary/10",
                        "scale-[1.01]",
                        "shadow-md",
                        "transform transition-all duration-200 ease-in-out",
                      ],
                      card.priority && "border-l-4",
                    )}
                    onClick={() =>
                      setSelectedCards((prev) => {
                        if (prev.includes(index)) {
                          return prev.filter((id) => id !== index);
                        }
                        return [...prev, index];
                      })
                    }
                  >
                    {selectedCards.includes(index) && (
                      <div className="absolute right-2 top-2 rounded-full bg-primary p-1 shadow-sm transition-opacity duration-200">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    {selectedCards.includes(index) && (
                      <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-tr from-primary/5 to-primary/10" />
                    )}
                  </CardBase>
                ))}
                {isGenerating && (
                  <>
                    <CardSkeleton />
                    <CardSkeleton />
                  </>
                )}
              </div>

              {!isGenerating && (
                <Button
                  onClick={handleAddCards}
                  isLoading={createManyCardsMutation.isPending}
                  disabled={
                    selectedCards.length === 0 ||
                    createManyCardsMutation.isPending
                  }
                  className="mt-4 w-full"
                >
                  Add {selectedCards.length} selected cards to board
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
