"use client";

import { Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { useCreateManyCards, useGenerateCards } from "~/lib/hooks";
import { type Priority } from "~/lib/utils";
import { type CardGenerateResponse, GeneratedCardSchema } from "~/server/zod";

import { CardSkeleton } from "./card-skeleton";
import { GeneratedCardPreview } from "./generated-card-preview";

interface GenerateCardFormProps {
  columnId: string;
  setOpen: (open: boolean) => void;
}

export function GenerateCardForm({ columnId, setOpen }: GenerateCardFormProps) {
  const params = useParams();
  const [prompt, setPrompt] = useState("");
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
    if (!prompt.trim() || !boardId) return;

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
      setPrompt("");
      setGeneratedCards([]);
      setSelectedCards([]);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="prompt" className="text-sm font-medium">
            Prompt
          </Label>
          <span className="text-xs text-muted-foreground">
            {prompt.length}/500 characters
          </span>
        </div>
        <Textarea
          id="prompt"
          value={prompt}
          placeholder="Example: 'I need to add user authentication using NextAuth.js with Google and GitHub providers'"
          className="resize-none"
          rows={4}
          onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
        />
        <p className="text-sm text-muted-foreground">
          Describe what tasks you want to generate for your board.
        </p>
      </div>

      <Button
        className="mt-2"
        onClick={handleGenerate}
        isLoading={isGenerating}
        disabled={!prompt.trim() || isGenerating}
      >
        {!isGenerating && <Sparkles className="mr-2 h-4 w-4" />}
        {isGenerating ? "Generating ideas..." : "Generate cards"}
      </Button>

      {generatedCards.length > 0 && (
        <div className="mt-4 space-y-4 border-t pt-4">
          <Separator className="bg-border/50" />

          <div className="flex items-center justify-between px-1">
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
            <div className="flex justify-end pt-2">
              <Button
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
